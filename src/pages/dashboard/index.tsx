import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";
import { DashboardPerformanceChart } from "@/components/dashboard/dashboard-performance-chart";
import { mapDashboardOverview, type DashboardKpi } from "@/lib/dashboard-metrics";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKpi[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      try {
        const overview = await api.getDashboardOverview();
        if (cancelled) return;
        setKpis(mapDashboardOverview(overview).kpis);
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load dashboard metrics";
          toast.error("Could not load dashboard", { description: message });
          setKpis([]);
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
        {loading ? (
          <div className="flex items-center justify-center rounded-lg border bg-card p-10 text-muted-foreground">
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
              />
            ))}
          </div>
        )}
      </section>

      <DashboardPerformanceChart role={user.role} />
    </div>
  );
}
