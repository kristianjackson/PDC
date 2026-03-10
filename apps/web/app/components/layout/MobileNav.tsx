import { NavLink } from "react-router";

import { APP_NAV_ITEMS } from "./navigation";

export function MobileNav() {
  return (
    <nav aria-label="Mobile" className="mobile-nav">
      {APP_NAV_ITEMS.map((item) => (
        <NavLink
          className={({ isActive }) =>
            `mobile-nav-link ${isActive ? "mobile-nav-link-active" : ""}`.trim()
          }
          key={item.to}
          prefetch="intent"
          to={item.to}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
