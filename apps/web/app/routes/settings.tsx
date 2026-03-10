import { data, Link } from "react-router";

import type { Route } from "./+types/settings";
import { Card } from "~/components/ui/Card";
import { requireViewer } from "~/lib/viewer.server";

export async function loader({ context, request }: Route.LoaderArgs) {
  const { responseHeaders, viewer } = await requireViewer({
    context,
    request,
  });

  return data(
    {
      viewer,
    },
    {
      headers: responseHeaders,
    },
  );
}

export default function Settings({ loaderData }: Route.ComponentProps) {
  return (
    <section className="page-grid">
      <Card>
        <p className="eyebrow">Settings</p>
        <h1>Account</h1>
        <p className="muted">{loaderData.viewer.user.email ?? "Signed in user"}</p>
      </Card>

      <div className="stats-grid">
        <Card>
          <h2>Environment</h2>
          <p className="muted">
            Worker bindings are wired through the root loader and Supabase helpers.
            Local runtime uses `apps/web/.dev.vars`, and deployed runtime can use Wrangler secrets.
          </p>
        </Card>
        <Card>
          <h2>Export</h2>
          <p className="muted">
            Download the full JSON export or CSV exports for daily and weekly data.
          </p>
          <div className="button-row">
            <Link className="button button-secondary" to="/export?format=json&type=all">
              Full JSON export
            </Link>
            <Link className="button button-secondary" to="/export?format=csv&type=daily">
              Daily CSV
            </Link>
            <Link className="button button-secondary" to="/export?format=csv&type=weekly">
              Weekly CSV
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
