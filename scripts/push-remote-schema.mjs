import { readFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const projectRef = args["project-ref"] ?? (await inferProjectRef());
const migrationsDir = args["migrations-dir"] ?? "supabase/migrations";
const token = await loadAccessToken(args.token);

if (!projectRef) {
  throw new Error(
    "Missing Supabase project ref. Pass --project-ref or link the project first.",
  );
}

if (!token) {
  throw new Error(
    "Missing Supabase access token. Pass --token, set SUPABASE_ACCESS_TOKEN, or sign in with the Supabase CLI.",
  );
}

const migrations = await listMigrationFiles(migrationsDir);

if (migrations.length === 0) {
  throw new Error(`No migration files found in ${migrationsDir}.`);
}

console.log(`Applying ${migrations.length} remote migrations to ${projectRef}`);

for (const migrationPath of migrations) {
  const query = await readFile(migrationPath, "utf8");
  const name = path.basename(migrationPath);

  console.log(`-> ${name}`);
  await postQuery({
    mode: "write",
    projectRef,
    query,
    token,
  });
}

const verification = await postQuery({
  mode: "read",
  projectRef,
  query:
    "select tablename from pg_tables where schemaname = 'public' and tablename in ('profiles','daily_entries','weekly_entries') order by tablename",
  token,
});

console.log("Verification:");
console.log(JSON.stringify(verification, null, 2));
console.log("Remote schema apply complete.");

async function inferProjectRef() {
  const candidates = [
    path.join("supabase", ".temp", "project-ref"),
    path.join("apps", "web", ".dev.vars"),
    ".env",
  ];

  for (const candidate of candidates) {
    try {
      const text = await readFile(candidate, "utf8");

      if (candidate.endsWith("project-ref")) {
        const value = text.trim();

        if (value) {
          return value;
        }

        continue;
      }

      const urlMatch = text.match(/SUPABASE_URL=(?:"|')?https:\/\/([a-z0-9]+)\.supabase\.co/i);

      if (urlMatch?.[1]) {
        return urlMatch[1];
      }
    } catch {
      // Ignore missing files and continue probing.
    }
  }

  return null;
}

async function loadAccessToken(tokenOverride) {
  if (typeof tokenOverride === "string" && tokenOverride.length > 0) {
    return tokenOverride;
  }

  if (typeof process.env.SUPABASE_ACCESS_TOKEN === "string") {
    return process.env.SUPABASE_ACCESS_TOKEN.trim();
  }

  try {
    return (await readFile(path.join(os.homedir(), ".supabase", "access-token"), "utf8")).trim();
  } catch {
    return null;
  }
}

async function listMigrationFiles(directory) {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

async function postQuery({ mode, projectRef, query, token }) {
  const endpoint =
    mode === "read"
      ? `https://api.supabase.com/v1/projects/${projectRef}/database/query/read-only`
      : `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

  let attempt = 0;
  let lastError;

  while (attempt < 5) {
    attempt += 1;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;

      if (attempt >= 5) {
        break;
      }

      const delayMs = attempt * 2_000;
      console.warn(`   retry ${attempt}/5 after ${delayMs}ms: ${error.message}`);
      await delay(delayMs);
    }
  }

  throw lastError;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const part = argv[index];

    if (!part.startsWith("--")) {
      continue;
    }

    const [rawKey, rawValue] = part.slice(2).split("=", 2);

    if (rawValue !== undefined) {
      parsed[rawKey] = rawValue;
      continue;
    }

    const next = argv[index + 1];

    if (next && !next.startsWith("--")) {
      parsed[rawKey] = next;
      index += 1;
      continue;
    }

    parsed[rawKey] = true;
  }

  return parsed;
}
