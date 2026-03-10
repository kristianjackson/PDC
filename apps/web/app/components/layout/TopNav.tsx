import { Form, NavLink } from "react-router";

import type { Viewer } from "~/lib/viewer.server";
import { APP_NAV_ITEMS } from "./navigation";

type TopNavProps = {
  viewer: Viewer | null;
};

export function TopNav({ viewer }: TopNavProps) {
  return (
    <header className="top-nav">
      <div>
        <NavLink className="brand-mark" to="/">
          <span className="brand-mark-kicker">Daily</span>
          <span>Life Telemetry</span>
        </NavLink>
        <p className="brand-subtitle">
          Daily check-ins, weekly review, and lightweight personal analytics.
        </p>
      </div>

      <div className="top-nav-actions">
        {viewer ? (
          <>
            <nav className="desktop-nav" aria-label="Primary">
              {APP_NAV_ITEMS.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "nav-link-active" : ""}`.trim()
                  }
                  key={item.to}
                  prefetch="intent"
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="viewer-pill">
              <span>{viewer.user.displayName}</span>
              <Form action="/logout" method="post">
                <button className="inline-action" type="submit">
                  Log out
                </button>
              </Form>
            </div>
          </>
        ) : (
          <NavLink className="nav-link nav-link-active" prefetch="intent" to="/auth">
            Sign in
          </NavLink>
        )}
      </div>
    </header>
  );
}
