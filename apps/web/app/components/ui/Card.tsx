import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "section";
};

export function Card({
  as = "section",
  children,
  className = "",
  ...props
}: CardProps) {
  const Tag = as;

  return (
    <Tag {...props} className={`card ${className}`.trim()}>
      {children}
    </Tag>
  );
}
