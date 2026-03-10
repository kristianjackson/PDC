import type { AppLoadContext } from "react-router";
import { redirect } from "react-router";
import type { User } from "@supabase/supabase-js";

import type { AppEnv } from "~/lib/env.server";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export type Viewer = {
  user: {
    id: string;
    email: string | null;
    displayName: string;
  };
  profile: {
    id: string;
    email: string | null;
  } | null;
};

type ViewerArgs = {
  env: AppEnv;
  request: Request;
};

type ProtectedViewerArgs = {
  context: AppLoadContext;
  request: Request;
};

export async function getViewer({ env, request }: ViewerArgs) {
  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient({
    env,
    request,
    responseHeaders,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Viewer["profile"] = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      profile = {
        id: data.id,
        email: data.email,
      };
    }
  }

  return {
    responseHeaders,
    supabase,
    viewer: user
      ? {
          user: {
            id: user.id,
            email: user.email ?? null,
            displayName: getUserDisplayName(user),
          },
          profile,
        }
      : null,
  };
}

export async function requireViewer({ context, request }: ProtectedViewerArgs) {
  const env = context.cloudflare.env;
  const result = await getViewer({
    env,
    request,
  });

  if (!result.viewer) {
    const url = new URL(request.url);
    const next = encodeURIComponent(`${url.pathname}${url.search}`);

    throw redirect(`/auth?next=${next}`, {
      headers: result.responseHeaders,
    });
  }

  return {
    ...result,
    env,
    viewer: result.viewer,
  };
}

function getUserDisplayName(user: User) {
  const metadataName = user.user_metadata?.display_name;

  if (typeof metadataName === "string" && metadataName.trim().length > 0) {
    return metadataName.trim();
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "You";
}
