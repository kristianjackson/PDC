import type { ReactNode } from "react";
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { AppShell } from "~/components/layout/AppShell";
import { getPublicEnv, type AppEnv } from "~/lib/env.server";
import { serializePublicEnvScript } from "~/lib/public-env";
import { getViewer } from "~/lib/viewer.server";

export function meta() {
  return [
    { title: "Life Telemetry" },
    {
      name: "description",
      content: "Fast daily life logging with morning and evening check-ins.",
    },
  ];
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",
  },
];

export async function loader({ context, request }: Route.LoaderArgs) {
  const env = context.cloudflare.env as AppEnv;
  const { responseHeaders, viewer } = await getViewer({
    env,
    request,
  });

  return data(
    {
      publicEnv: getPublicEnv(env),
      viewer,
    },
    {
      headers: responseHeaders,
    },
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializePublicEnvScript(loaderData.publicEnv),
        }}
        suppressHydrationWarning
      />
      <AppShell viewer={loaderData.viewer}>
        <Outlet />
      </AppShell>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something broke";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "Page not found" : "Request failed";
    details = error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="error-state">
      <section className="card error-card">
        <p className="eyebrow">Life Telemetry</p>
        <h1>{message}</h1>
        <p>{details}</p>
      </section>
      {stack ? (
        <pre className="error-stack">
          <code>{stack}</code>
        </pre>
      ) : null}
    </main>
  );
}
