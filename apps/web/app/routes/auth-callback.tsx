import { data, Link, redirect } from "react-router";
import { startTransition, useEffect, useState } from "react";

import type { Route } from "./+types/auth-callback";
import { Card } from "~/components/ui/Card";
import { ensureProfile } from "~/lib/db/profiles.server";
import { getSupabaseBrowserClient } from "~/lib/supabase/client";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const responseHeaders = new Headers();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = normalizeNext(url.searchParams.get("next"));

  if (!code) {
    return data(
      {
        next,
      },
      {
        headers: responseHeaders,
      },
    );
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

export default function AuthCallback({ loaderData }: Route.ComponentProps) {
  const [status, setStatus] = useState<{
    error: string | null;
    loading: boolean;
  }>({
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function finishHashSession() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (!accessToken || !refreshToken) {
        if (!cancelled) {
          setStatus({
            error: "This sign-in link is missing session data. Request a fresh magic link.",
            loading: false,
          });
        }
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        if (!cancelled) {
          setStatus({
            error: error.message,
            loading: false,
          });
        }
        return;
      }

      startTransition(() => {
        window.location.replace(loaderData.next);
      });
    }

    void finishHashSession();

    return () => {
      cancelled = true;
    };
  }, [loaderData.next]);

  return (
    <section className="page-narrow">
      <Card className="form-card">
        <p className="eyebrow">Auth</p>
        <h1>{status.loading ? "Signing you in..." : "Sign-in needs attention"}</h1>
        <p className="muted">
          {status.loading
            ? "Finishing the magic-link session and redirecting you into the app."
            : status.error}
        </p>
        {status.loading ? null : (
          <div className="button-row">
            <Link className="button button-primary" to="/auth">
              Request another link
            </Link>
          </div>
        )}
      </Card>
    </section>
  );
}

function normalizeNext(value: string | null) {
  if (typeof value !== "string" || value.length === 0 || !value.startsWith("/")) {
    return "/";
  }

  return value;
}
