import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

export type KpiAccent = "crimson" | "gold" | "emerald" | "violet" | "sky";

const accentStyles: Record<
  KpiAccent,
  { border: string; icon: string; trend: string; spark: string }
> = {
  crimson: {
    border: "border-l-primary",
    icon: "bg-primary/10 text-primary",
    trend: "bg-primary/10 text-primary",
    spark: "stroke-primary",
  },
  gold: {
    border: "border-l-[oklch(0.72_0.14_75)]",
    icon: "bg-[oklch(0.92_0.06_75)] text-[oklch(0.45_0.12_55)]",
    trend: "bg-[oklch(0.94_0.05_75)] text-[oklch(0.45_0.12_55)]",
    spark: "stroke-[oklch(0.55_0.14_65)]",
  },
  emerald: {
    border: "border-l-emerald-500",
    icon: "bg-emerald-50 text-emerald-700",
    trend: "bg-emerald-50 text-emerald-700",
    spark: "stroke-emerald-500",
  },
  violet: {
    border: "border-l-violet-500",
    icon: "bg-violet-50 text-violet-700",
    trend: "bg-violet-50 text-violet-700",
    spark: "stroke-violet-500",
  },
  sky: {
    border: "border-l-sky-500",
    icon: "bg-sky-50 text-sky-700",
    trend: "bg-sky-50 text-sky-700",
    spark: "stroke-sky-500",
  },
};

function MiniSparkline({ accent, trend }: { accent: KpiAccent; trend?: "up" | "down" }) {
  const styles = accentStyles[accent];
  const points =
    trend === "down"
      ? "2,12 8,10 14,11 20,8 26,9 32,6"
      : "2,14 8,12 14,10 20,11 26,7 32,5";

  return (
    <svg viewBox="0 0 34 16" className="h-3.5 w-10" aria-hidden>
      <polyline
        fill="none"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.spark}
        points={points}
      />
    </svg>
  );
}

export interface KpiCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  breakdown?: string;
  accent?: KpiAccent;
}

export function KpiCard({
  icon: Icon,
  value,
  label,
  delta,
  trend = "up",
  breakdown,
  accent = "crimson",
}: KpiCardProps) {
  const styles = accentStyles[accent];
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-soft transition-all",
        "hover:-translate-y-0.5 hover:shadow-md border-l-4",
        styles.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              styles.icon,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
        </div>
        {delta && (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold shrink-0",
              styles.trend,
            )}
          >
            <MiniSparkline accent={accent} trend={trend === "down" ? "down" : "up"} />
            <TrendIcon className="h-3 w-3" />
            <span>{delta}</span>
          </div>
        )}
      </div>

      <div className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
        {value}
      </div>

      {breakdown && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{breakdown}</p>
      )}
    </div>
  );
}
