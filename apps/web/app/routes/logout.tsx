import { redirect } from "react-router";

import type { Route } from "./+types/logout";
import { createSupabaseServerClient } from "~/lib/supabase/server";

export async function action({ context, request }: Route.ActionArgs) {
  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient({
    env: context.cloudflare.env,
    request,
    responseHeaders,
  });

  await supabase.auth.signOut();

  throw redirect("/auth", {
    headers: responseHeaders,
  });
}

export default function Logout() {
  return null;
}
