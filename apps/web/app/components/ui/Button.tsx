import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  block?: boolean;
  busy?: boolean;
  busyLabel?: string;
  tone?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  block = false,
  busy = false,
  busyLabel,
  children,
  className = "",
  disabled,
  tone = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const toneClass =
    tone === "primary"
      ? "button-primary"
      : tone === "danger"
        ? "button-danger"
      : tone === "secondary"
        ? "button-secondary"
        : "button-ghost";

  return (
    <button
      {...props}
      className={`button ${toneClass} ${block ? "button-block" : ""} ${className}`.trim()}
      disabled={disabled || busy}
      type={type}
    >
      {busy ? busyLabel ?? "Saving..." : children}
    </button>
  );
}
