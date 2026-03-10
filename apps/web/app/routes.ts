import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth", "routes/auth.tsx"),
  route("auth/callback", "routes/auth-callback.tsx"),
  route("checkin/morning", "routes/checkin.morning.tsx"),
  route("checkin/evening", "routes/checkin.evening.tsx"),
  route("weekly", "routes/weekly.tsx"),
  route("history", "routes/history.tsx"),
  route("history/daily/:date", "routes/history.daily.$date.tsx"),
  route("history/weekly/:date", "routes/history.weekly.$date.tsx"),
  route("export", "routes/export.tsx"),
  route("settings", "routes/settings.tsx"),
  route("logout", "routes/logout.tsx"),
] satisfies RouteConfig;
