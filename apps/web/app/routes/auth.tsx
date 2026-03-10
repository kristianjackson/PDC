import { data, Form, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/auth";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { InputField } from "~/components/ui/InputField";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import { getViewer } from "~/lib/viewer.server";

type ActionData = {
  error?: string;
  success?: string;
  values?: {
    email: string;
  };
};

export async function loader({ context, request }: Route.LoaderArgs) {
  const { responseHeaders, viewer } = await getViewer({
    env: context.cloudflare.env,
    request,
  });

  if (viewer) {
    throw redirect("/", {
      headers: responseHeaders,
    });
  }

  return data(
    {
      error: new URL(request.url).searchParams.get("error"),
      next: normalizeNext(new URL(request.url).searchParams.get("next")),
    },
    {
      headers: responseHeaders,
    },
  );
}

export async function action({ context, request }: Route.ActionArgs) {
  const responseHeaders = new Headers();
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const next = normalizeNext(String(formData.get("next") ?? "/"));

  if (!email || !email.includes("@")) {
    return data<ActionData>(
      {
        error: "Enter a valid email address.",
        values: {
          email,
        },
      },
      {
        headers: responseHeaders,
        status: 400,
      },
    );
  }

  const supabase = createSupabaseServerClient({
    env: context.cloudflare.env,
    request,
    responseHeaders,
  });

  const callbackUrl = new URL("/auth/callback", request.url);
  callbackUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      shouldCreateUser: true,
    },
  });

  if (error) {
    return data<ActionData>(
      {
        error: error.message,
        values: {
          email,
        },
      },
      {
        headers: responseHeaders,
        status: 400,
      },
    );
  }

  return data<ActionData>(
    {
      success: `Magic link sent to ${email}.`,
      values: {
        email,
      },
    },
    {
      headers: responseHeaders,
    },
  );
}

export default function Auth({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const values = actionData?.values ?? {
    email: "",
  };

  return (
    <section className="page-narrow">
      <Card className="form-card">
        <p className="eyebrow">Auth</p>
        <h1>Sign in with a magic link</h1>
        <p className="muted">
          This stays single-user and low-friction for MVP. No separate password flow is
          needed.
        </p>

        {loaderData.error ? <p className="banner banner-error">{loaderData.error}</p> : null}
        {actionData?.error ? <p className="banner banner-error">{actionData.error}</p> : null}
        {actionData?.success ? <p className="banner banner-success">{actionData.success}</p> : null}

        <Form className="stack" method="post">
          <input name="next" type="hidden" value={loaderData.next} />
          <InputField
            autoComplete="email"
            autoFocus
            defaultValue={values.email}
            label="Email"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
          <Button block busy={isSubmitting} busyLabel="Sending link..." type="submit">
            Send magic link
          </Button>
        </Form>
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
