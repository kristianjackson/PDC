import { createBrowserClient } from "@supabase/ssr";

import { getPublicEnvFromWindow } from "~/lib/public-env";
import { retryingFetch } from "~/lib/supabase/retrying-fetch";
import type { Database } from "~/types/database";

let browserClient:
  | ReturnType<typeof createBrowserClient<Database, "public">>
  | undefined;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const publicEnv = getPublicEnvFromWindow();

    browserClient = createBrowserClient<Database, "public">(
      publicEnv.supabaseUrl,
      publicEnv.supabaseAnonKey,
      {
        auth: {
          flowType: "pkce",
        },
        global: {
          fetch: retryingFetch,
          headers: {
            "X-Client-Info": "life-telemetry/web-browser",
          },
        },
      },
    );
  }

  return browserClient;
}
