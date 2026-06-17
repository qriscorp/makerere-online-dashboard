import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";
import { api, type ApiDashboardMetricKey } from "@/lib/api";
import { DashboardSectionTitle } from "@/components/dashboard/dashboard-welcome";
import type { UserRole } from "@/lib/types";

type RangeKey = "30d" | "7d";

const metricLabels: Record<ApiDashboardMetricKey, string> = {
  enrollments: "Enrollments",
  completions: "Course completions",
  assessments: "Assessment attempts",
};

function getChartConfig(role: UserRole) {
  if (role === "student") {
    return {
      title: "Learning progress",
      description: "Your study activity over time",
      metrics: [
        { key: "enrollments" as ApiDashboardMetricKey, label: "Enrollments" },
        { key: "assessments" as ApiDashboardMetricKey, label: "Assessments" },
        { key: "completions" as ApiDashboardMetricKey, label: "Completed" },
      ],
    };
  }
  if (role === "lecturer") {
    return {
      title: "Teaching activity",
      description: "Student engagement across your classes",
      metrics: [
        { key: "enrollments" as ApiDashboardMetricKey, label: "Active students" },
        { key: "assessments" as ApiDashboardMetricKey, label: "Submissions" },
        { key: "completions" as ApiDashboardMetricKey, label: "Graded" },
      ],
    };
  }
  return {
    title: "Academic performance",
    description: "Platform-wide learning and enrollment trends",
    metrics: [
      { key: "enrollments" as ApiDashboardMetricKey, label: "Enrollments" },
      { key: "completions" as ApiDashboardMetricKey, label: "Completions" },
      { key: "assessments" as ApiDashboardMetricKey, label: "Assessments" },
    ],
  };
}

export function DashboardPerformanceChart({ role }: { role: UserRole }) {
  const config = getChartConfig(role);
  const [metric, setMetric] = useState<ApiDashboardMetricKey>("enrollments");
  const [range, setRange] = useState<RangeKey>("30d");
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<{ date: string; value: number }[]>([]);

  const days = range === "7d" ? 7 : 30;

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      setLoading(true);
      try {
        const response = await api.getDashboardActivity({ metric, days });
        if (!cancelled) {
          setPoints(response.points.map((point) => ({ date: point.date, value: point.value })));
        }
      } catch {
        if (!cancelled) {
          setPoints([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadActivity();
    return () => {
      cancelled = true;
    };
  }, [metric, days, role]);

  const data = useMemo(() => points, [points]);

  return (
    <section className="rounded-lg border bg-card p-5 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <DashboardSectionTitle title={config.title} />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="inline-flex rounded-md border bg-muted/50 p-1">
            {config.metrics.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMetric(item.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  metric === item.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-md border bg-muted/50 p-1">
            {(
              [
                { key: "30d" as RangeKey, label: "Last 30 days" },
                { key: "7d" as RangeKey, label: "Last 7 days" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setRange(item.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  range === item.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 h-[280px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading chart...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No activity recorded for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.42 0.18 25)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="oklch(0.42 0.18 25)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.922 0 0)" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickMargin={8}
                stroke="oklch(0.556 0 0)"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickMargin={8}
                stroke="oklch(0.556 0 0)"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid oklch(0.922 0 0)",
                  boxShadow: "0 1px 2px 0 oklch(0 0 0 / 0.05)",
                }}
                formatter={(value: number) => [value, metricLabels[metric]]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="oklch(0.42 0.18 25)"
                strokeWidth={2}
                fill="url(#dashboardArea)"
                dot={false}
                activeDot={{ r: 5, fill: "oklch(0.42 0.18 25)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
