import type { ReactNode } from "react";

import type { Viewer } from "~/lib/viewer.server";
import { MobileNav } from "./MobileNav";
import { TopNav } from "./TopNav";

type AppShellProps = {
  children: ReactNode;
  viewer: Viewer | null;
};

export function AppShell({ children, viewer }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="app-shell-backdrop" />
      <div className="app-shell-frame">
        <TopNav viewer={viewer} />
        <main className="app-main">{children}</main>
      </div>
      {viewer ? <MobileNav /> : null}
    </div>
  );
}
