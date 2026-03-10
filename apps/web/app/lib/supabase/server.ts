import { createServerClient } from "@supabase/ssr";
import { parse, serialize } from "cookie";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv, type AppEnv } from "~/lib/env.server";
import { retryingFetch } from "~/lib/supabase/retrying-fetch";
import type { Database } from "~/types/database";

type CookieRecord = {
  name: string;
  value: string;
};

type ServerClientArgs = {
  env: AppEnv;
  request: Request;
  responseHeaders: Headers;
};

export function createSupabaseServerClient({
  env,
  request,
  responseHeaders,
}: ServerClientArgs) {
  const { supabaseAnonKey, supabaseUrl } = getPublicEnv(env);
  const requestCookies = parseCookieHeader(request.headers.get("cookie"));

  return createServerClient<Database, "public">(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
    cookies: {
      getAll() {
        return requestCookies;
      },
      async setAll(cookiesToSet) {
        for (const cookieToSet of cookiesToSet) {
          const index = requestCookies.findIndex(
            (cookie) => cookie.name === cookieToSet.name,
          );

          if (index === -1) {
            requestCookies.push({
              name: cookieToSet.name,
              value: cookieToSet.value,
            });
          } else {
            requestCookies[index] = {
              name: cookieToSet.name,
              value: cookieToSet.value,
            };
          }

          responseHeaders.append(
            "Set-Cookie",
            serialize(cookieToSet.name, cookieToSet.value, cookieToSet.options),
          );
        }
      },
    },
    global: {
      fetch: retryingFetch,
      headers: {
        "X-Client-Info": "life-telemetry/web-server",
      },
    },
  });
}

export type AppSupabaseClient = SupabaseClient<Database, "public">;

function parseCookieHeader(header: string | null): CookieRecord[] {
  if (!header) {
    return [];
  }

  return Object.entries(parse(header)).map(([name, value]) => ({
    name,
    value: value ?? "",
  }));
}
