import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

const args = parseArgs(process.argv.slice(2));
const rootDir = process.cwd();
const envPath = path.resolve(rootDir, args["env-file"] ?? ".env");
const env = await loadEnvFile(envPath);

const supabaseUrl = requireEnv(env, "SUPABASE_URL");
const serviceRoleKey = requireEnv(env, "SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      "X-Client-Info": "life-telemetry/export-script",
    },
  },
});

const target = await resolveTargetUser(supabase, args);
const [dailyEntries, weeklyEntries] = await Promise.all([
  fetchRows(supabase, "daily_entries", target.id, "entry_date"),
  fetchRows(supabase, "weekly_entries", target.id, "week_end_date"),
]);

const payload = {
  exported_at: new Date().toISOString(),
  profile: target,
  daily_entries: dailyEntries,
  weekly_entries: weeklyEntries,
};

const outputPath = path.resolve(
  rootDir,
  args.output ?? `exports/life-telemetry-${slugify(target.email ?? target.id)}-${new Date().toISOString().slice(0, 10)}.json`,
);

await mkdir(path.dirname(outputPath), {
  recursive: true,
});
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`Exported ${dailyEntries.length} daily entries and ${weeklyEntries.length} weekly entries to ${outputPath}`);

async function fetchRows(client, table, userId, dateColumn) {
  const { data, error } = await client
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .order(dateColumn, { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function resolveTargetUser(client, parsedArgs) {
  if (parsedArgs["user-id"]) {
    const { data, error } = await client
      .from("profiles")
      .select("id, email")
      .eq("id", parsedArgs["user-id"])
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(`No profile found for user id ${parsedArgs["user-id"]}.`);
    }

    return data;
  }

  if (parsedArgs.email) {
    const { data, error } = await client
      .from("profiles")
      .select("id, email")
      .eq("email", parsedArgs.email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(`No profile found for email ${parsedArgs.email}.`);
    }

    return data;
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, email")
    .limit(2);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("No profiles found. Pass --user-id or --email once a user exists.");
  }

  if (data.length > 1) {
    throw new Error("Multiple profiles found. Pass --user-id or --email to choose one.");
  }

  return data[0];
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const nextToken = argv[index + 1];

    if (!nextToken || nextToken.startsWith("--")) {
      parsed[key] = "true";
      continue;
    }

    parsed[key] = nextToken;
    index += 1;
  }

  return parsed;
}

async function loadEnvFile(filePath) {
  const { readFile } = await import("node:fs/promises");
  const text = await readFile(filePath, "utf8");
  const entries = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    entries[key] = stripQuotes(value);
  }

  return entries;
}

function requireEnv(env, key) {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required env value: ${key}`);
  }

  return value;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
