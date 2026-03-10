import type { PublicEnv } from "./public-env";

export type AppEnv = {
  APP_NAME?: string;
  OPENAI_API_KEY?: string;
  OPENAI_CHAT_MODEL?: string;
  OPENAI_EMBEDDING_MODEL?: string;
  SESSION_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

export function requireEnvBinding<T extends keyof AppEnv>(env: AppEnv, key: T) {
  const value = env[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required environment binding: ${String(key)}`);
  }

  return value;
}

export function getPublicEnv(env: AppEnv): PublicEnv {
  return {
    appName: env.APP_NAME ?? "Life Telemetry",
    supabaseUrl: requireEnvBinding(env, "SUPABASE_URL"),
    supabaseAnonKey: requireEnvBinding(env, "SUPABASE_ANON_KEY"),
  };
}
