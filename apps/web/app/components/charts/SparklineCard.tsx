import { Card } from "~/components/ui/Card";

type SparklineCardProps = {
  accent?: "teal" | "amber" | "rose";
  emptyLabel?: string;
  points: number[];
  subtitle: string;
  title: string;
  value: string;
};

export function SparklineCard({
  accent = "teal",
  emptyLabel = "Not enough data",
  points,
  subtitle,
  title,
  value,
}: SparklineCardProps) {
  return (
    <Card className="sparkline-card">
      <p className="eyebrow">{title}</p>
      <h2>{value}</h2>
      <p className="muted">{subtitle}</p>
      {points.length > 1 ? (
        <Sparkline accent={accent} points={points} />
      ) : (
        <p className="chart-empty">{emptyLabel}</p>
      )}
    </Card>
  );
}

function Sparkline({
  accent,
  points,
}: {
  accent: "teal" | "amber" | "rose";
  points: number[];
}) {
  const width = 240;
  const height = 88;
  const padding = 8;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const path = points
    .map((point, index) => {
      const x = padding + (index / (points.length - 1)) * (width - padding * 2);
      const y =
        height -
        padding -
        ((point - min) / range) * (height - padding * 2);

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      className={`sparkline sparkline-${accent}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path d={path} fill="none" />
    </svg>
  );
}
