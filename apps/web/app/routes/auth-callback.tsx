import { redirect } from "react-router";

import type { Route } from "./+types/auth-callback";
import { ensureProfile } from "~/lib/db/profiles.server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = normalizeNext(url.searchParams.get("next"));

  if (!code) {
    throw redirect(`/auth?error=${encodeURIComponent("Missing auth code.")}`, {
      headers: responseHeaders,
    });
  }

  const supabase = createSupabaseServerClient({
    env: context.cloudflare.env,
    request,
    responseHeaders,
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw redirect(`/auth?error=${encodeURIComponent(error.message)}`, {
      headers: responseHeaders,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfile(supabase, user);
  }

  throw redirect(next, {
    headers: responseHeaders,
  });
}

function normalizeNext(value: string | null) {
  if (typeof value !== "string" || value.length === 0 || !value.startsWith("/")) {
    return "/";
  }

  return value;
}
