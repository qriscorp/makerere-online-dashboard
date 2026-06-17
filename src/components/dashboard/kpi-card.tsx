import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type KpiAccent = "crimson" | "gold" | "emerald" | "violet" | "sky";

export interface KpiCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  breakdown?: string;
  accent?: KpiAccent;
}

export function KpiCard({ icon: Icon, value, label }: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-5 transition-colors",
        "hover:border-border/90",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
