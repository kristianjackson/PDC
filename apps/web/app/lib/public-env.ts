export type PublicEnv = {
  appName: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

declare global {
  interface Window {
    __LIFE_TELEMETRY_ENV__?: PublicEnv;
  }
}

export function serializePublicEnvScript(publicEnv: PublicEnv) {
  return `window.__LIFE_TELEMETRY_ENV__ = ${JSON.stringify(publicEnv)};`;
}

export function getPublicEnvFromWindow() {
  if (
    typeof window === "undefined" ||
    typeof window.__LIFE_TELEMETRY_ENV__ === "undefined"
  ) {
    throw new Error("Life Telemetry public environment is not available in the browser runtime.");
  }

  return window.__LIFE_TELEMETRY_ENV__;
}
