import { useAuth } from "@/lib/auth-context";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  DashboardWelcome,
  DashboardSectionTitle,
} from "@/components/dashboard/dashboard-welcome";
import { DashboardPerformanceChart } from "@/components/dashboard/dashboard-performance-chart";
import { getDashboardFocus, getDashboardKpis } from "@/lib/dashboard-metrics";
export default function DashboardOverview() {
  const { user } = useAuth();
  const kpis = getDashboardKpis(user.role);
  const focus = getDashboardFocus(user.role);

  return (
    <div className="space-y-6">
      <DashboardWelcome />

      <section className="space-y-4">
        <DashboardSectionTitle
          title="Key metrics"
          description="Academic performance indicators at a glance"
        />
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
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {focus.secondaryStats.map((stat) => (
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