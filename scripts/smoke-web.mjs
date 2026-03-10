import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const args = parseArgs(process.argv.slice(2));
const env = await loadEnvFile(args["env-file"] ?? "./apps/web/.dev.vars");
const baseUrl = args["base-url"] ?? "http://127.0.0.1:5173";
const smokeEmail = args.email ?? env.SMOKE_EMAIL ?? "smoke+pdc@example.com";
const smokePassword = args.password ?? env.SMOKE_PASSWORD ?? "Smoke-pdc-A1!";

const supabaseUrl = requireEnv(env, "SUPABASE_URL");
const anonKey = requireEnv(env, "SUPABASE_ANON_KEY");
const serviceRoleKey = requireEnv(env, "SUPABASE_SERVICE_ROLE_KEY");

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
const anon = createClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const signInResult = await ensureSmokeSession({
  admin,
  anon,
  email: smokeEmail,
  password: smokePassword,
});

if (signInResult.error || !signInResult.data.session) {
  throw signInResult.error ?? new Error("Failed to sign in smoke user.");
}

const cookieJar = new Map();
const cookieClient = createServerClient(supabaseUrl, anonKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    flowType: "pkce",
  },
  cookies: {
    getAll() {
      return [...cookieJar.entries()].map(([name, value]) => ({ name, value }));
    },
    async setAll(cookiesToSet) {
      for (const cookie of cookiesToSet) {
        cookieJar.set(cookie.name, cookie.value);
      }
    },
  },
});

const { error: setSessionError } = await withRetry(
  () =>
    cookieClient.auth.setSession({
      access_token: signInResult.data.session.access_token,
      refresh_token: signInResult.data.session.refresh_token,
    }),
  "set smoke session",
);

if (setSessionError) {
  throw setSessionError;
}

const today = new Date().toISOString().slice(0, 10);
const sunday = getCurrentWeekEndDate();

await expectStatus(await appFetch("/checkin/morning"), 200, "morning page");
await postForm("/checkin/morning", {
  bodyWeight: "185.2",
  entryDate: today,
  morningMood: "7",
  sleepDurationHours: "7.5",
  sleepQuality: "8",
  wakeEnergy: "6",
});
await postForm("/checkin/evening", {
  alcoholCount: "1",
  caffeineCount: "2",
  conflictLevel: "2",
  entryDate: today,
  eveningMood: "8",
  exerciseCompleted: "true",
  meaningfulSocialContact: "true",
  meditationCompleted: "true",
  notes: "Smoke test note",
  productivityLevel: "7",
  steps: "9000",
  stressLevel: "4",
});
await postForm("/weekly", {
  entertainmentLoad: "4",
  inboxPressure: "5",
  nutritionConsistency: "7",
  reflection: "Smoke weekly reflection",
  relationshipStability: "8",
  screenTimeEstimate: "4",
  socialConnection: "7",
  trainingConsistency: "8",
  travelWeek: "false",
  weekEndDate: sunday,
});
await postForm(`/history/daily/${today}`, {
  bodyWeight: "184.6",
  entryDate: today,
  intent: "save-morning",
  morningMood: "8",
  sleepDurationHours: "8.0",
  sleepQuality: "8",
  wakeEnergy: "7",
});
await postForm(`/history/weekly/${sunday}`, {
  entertainmentLoad: "5",
  inboxPressure: "5",
  intent: "save-weekly",
  nutritionConsistency: "8",
  reflection: "Updated smoke weekly reflection",
  relationshipStability: "8",
  screenTimeEstimate: "4",
  socialConnection: "8",
  trainingConsistency: "8",
  travelWeek: "false",
  weekEndDate: sunday,
});

const historyPage = await appFetch(`/history?q=smoke&scope=all`);
await expectStatus(historyPage, 200, "history page");
const historyHtml = await historyPage.text();

if (!historyHtml.toLowerCase().includes("smoke")) {
  throw new Error("History page did not include smoke test content.");
}

const exportResponse = await appFetch("/export?format=json&type=all");
await expectStatus(exportResponse, 200, "export route");
const exportJson = await exportResponse.json();

if (
  !Array.isArray(exportJson.daily_entries) ||
  !exportJson.daily_entries.some((entry) => entry.entry_date === today)
) {
  throw new Error("Export payload did not include the smoke daily entry.");
}

await postForm(`/history/daily/${today}`, {
  intent: "delete",
});
await postForm(`/history/weekly/${sunday}`, {
  intent: "delete",
});

console.log(`Smoke test passed for ${baseUrl}`);

async function appFetch(pathname, init = {}) {
  const response = await withRetry(
    () =>
      fetch(new URL(pathname, baseUrl), {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          cookie: serializeCookies(cookieJar),
        },
        redirect: "manual",
      }),
    `fetch ${pathname}`,
  );

  syncCookies(response);

  if (
    response.status >= 300 &&
    response.status < 400 &&
    response.headers.get("location")
  ) {
    return appFetch(response.headers.get("location"), {
      method: "GET",
    });
  }

  return response;
}

async function postForm(pathname, values) {
  const formData = new URLSearchParams(values);
  const response = await appFetch(pathname, {
    body: formData.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  await expectStatus(response, 200, pathname);
  return response.text();
}

function syncCookies(response) {
  const setCookies = response.headers.getSetCookie?.() ?? [];

  for (const cookie of setCookies) {
    const [pair] = cookie.split(";");
    const separatorIndex = pair.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    cookieJar.set(pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1));
  }
}

function serializeCookies(jar) {
  return [...jar.entries()]
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

async function ensureSmokeUser(client, email, password) {
  try {
    const { error } = await withRetry(
      () =>
        client.auth.admin.createUser({
          email,
          email_confirm: true,
          password,
        }),
      "create smoke user",
    );

    if (error && !isRecoverableCreateError(error)) {
      throw error;
    }
  } catch (error) {
    if (!shouldRetry(error)) {
      throw error;
    }
  }
}

async function ensureSmokeSession({ admin, anon, email, password }) {
  const existingSession = await signInSmokeUser(anon, email, password);

  if (!existingSession.error && existingSession.data.session) {
    return existingSession;
  }

  await ensureSmokeUser(admin, email, password);

  const createdSession = await signInSmokeUser(anon, email, password);

  if (createdSession.error || !createdSession.data.session) {
    throw createdSession.error ?? new Error("Failed to sign in smoke user.");
  }

  return createdSession;
}

function signInSmokeUser(client, email, password) {
  return withRetry(
    () =>
      client.auth.signInWithPassword({
        email,
        password,
      }),
    "sign in smoke user",
  );
}

async function withRetry(run, label, attempts = 8) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error) || attempt === attempts) {
        break;
      }

      const delayMs = attempt * 1_500;
      console.warn(`${label} failed, retrying in ${delayMs}ms: ${error.message}`);
      await delay(delayMs);
    }
  }

  throw lastError;
}

function shouldRetry(error) {
  const code = error?.cause?.code ?? error?.code;
  const message = getErrorMessage(error).toLowerCase();
  const retriableCodes = new Set([
    "ECONNRESET",
    "EAI_AGAIN",
    "ENOTFOUND",
    "ETIMEDOUT",
    "UND_ERR_CONNECT_TIMEOUT",
  ]);

  return (
    retriableCodes.has(code) ||
    message.includes("fetch failed") ||
    message.includes("connection reset") ||
    message.includes("network")
  );
}

function isRecoverableCreateError(error) {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("already been registered") ||
    message.includes("already registered") ||
    message.includes("user already exists")
  );
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    const causeMessage =
      error.cause instanceof Error ? error.cause.message : String(error.cause ?? "");

    return `${error.message} ${causeMessage}`.trim();
  }

  return String(error ?? "");
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function expectStatus(response, expected, label) {
  if (response.status !== expected) {
    throw new Error(`${label} returned ${response.status}, expected ${expected}.`);
  }
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

function requireEnv(env, key) {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required env value: ${key}`);
  }

  return value;
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

function getCurrentWeekEndDate() {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntilSunday = (7 - day) % 7;
  now.setUTCDate(now.getUTCDate() + daysUntilSunday);

  return now.toISOString().slice(0, 10);
}
