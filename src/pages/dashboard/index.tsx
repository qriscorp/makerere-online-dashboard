import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  DashboardWelcome,
  DashboardSectionTitle,
} from "@/components/dashboard/dashboard-welcome";
import { DashboardPerformanceChart } from "@/components/dashboard/dashboard-performance-chart";
import {
  mapDashboardOverview,
  type DashboardKpi,
  type DashboardSecondaryStat,
} from "@/lib/dashboard-metrics";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKpi[]>([]);
  const [secondaryStats, setSecondaryStats] = useState<DashboardSecondaryStat[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      try {
        const overview = await api.getDashboardOverview();
        if (cancelled) return;
        const mapped = mapDashboardOverview(overview);
        setKpis(mapped.kpis);
        setSecondaryStats(mapped.secondaryStats);
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load dashboard metrics";
          toast.error("Could not load dashboard", { description: message });
          setKpis([]);
          setSecondaryStats([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOverview();
    return () => {
      cancelled = true;
    };
  }, [user.role]);

  return (
    <div className="space-y-6">
      <DashboardWelcome />

      <section className="space-y-4">
        <DashboardSectionTitle
          title="Key metrics"
          description="Academic performance indicators at a glance"
        />
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border/80 bg-card p-10 text-muted-foreground shadow-soft">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading metrics...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiCard
                key={kpi.label}
                icon={kpi.icon}
                value={kpi.value}
                label={kpi.label}
                delta={kpi.delta}
                trend={kpi.trend}
                breakdown={kpi.breakdown}
                accent={kpi.accent}
              />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[76px] animate-pulse rounded-2xl border border-border/80 bg-muted/40"
              />
            ))
          : secondaryStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3.5 shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
            ))}
      </div>

      <DashboardPerformanceChart role={user.role} />
    </div>
  );
}
