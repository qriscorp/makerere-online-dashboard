import { useMemo, useState } from "react";
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
import { DashboardSectionTitle } from "@/components/dashboard/dashboard-welcome";
import type { UserRole } from "@/lib/types";

type MetricKey = "enrollments" | "completions" | "assessments";
type RangeKey = "30d" | "7d";

const chartData30: Record<MetricKey, { date: string; value: number }[]> = {
  enrollments: [
    { date: "May 19", value: 42 },
    { date: "May 22", value: 58 },
    { date: "May 25", value: 51 },
    { date: "May 28", value: 73 },
    { date: "May 31", value: 68 },
    { date: "Jun 3", value: 84 },
    { date: "Jun 6", value: 79 },
    { date: "Jun 9", value: 96 },
    { date: "Jun 12", value: 88 },
    { date: "Jun 15", value: 102 },
  ],
  completions: [
    { date: "May 19", value: 18 },
    { date: "May 22", value: 24 },
    { date: "May 25", value: 21 },
    { date: "May 28", value: 29 },
    { date: "May 31", value: 27 },
    { date: "Jun 3", value: 33 },
    { date: "Jun 6", value: 31 },
    { date: "Jun 9", value: 38 },
    { date: "Jun 12", value: 35 },
    { date: "Jun 15", value: 41 },
  ],
  assessments: [
    { date: "May 19", value: 64 },
    { date: "May 22", value: 71 },
    { date: "May 25", value: 69 },
    { date: "May 28", value: 78 },
    { date: "May 31", value: 74 },
    { date: "Jun 3", value: 82 },
    { date: "Jun 6", value: 79 },
    { date: "Jun 9", value: 86 },
    { date: "Jun 12", value: 83 },
    { date: "Jun 15", value: 89 },
  ],
};

const metricLabels: Record<MetricKey, string> = {
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
        { key: "enrollments" as MetricKey, label: "Lessons" },
        { key: "assessments" as MetricKey, label: "Assessments" },
        { key: "completions" as MetricKey, label: "Completed" },
      ],
    };
  }
  if (role === "lecturer") {
    return {
      title: "Teaching activity",
      description: "Student engagement across your classes",
      metrics: [
        { key: "enrollments" as MetricKey, label: "Active students" },
        { key: "assessments" as MetricKey, label: "Submissions" },
        { key: "completions" as MetricKey, label: "Graded" },
      ],
    };
  }
  return {
    title: "Academic performance",
    description: "Platform-wide learning and enrollment trends",
    metrics: [
      { key: "enrollments" as MetricKey, label: "Enrollments" },
      { key: "completions" as MetricKey, label: "Completions" },
      { key: "assessments" as MetricKey, label: "Assessments" },
    ],
  };
}

export function DashboardPerformanceChart({ role }: { role: UserRole }) {
  const config = getChartConfig(role);
  const [metric, setMetric] = useState<MetricKey>("enrollments");
  const [range, setRange] = useState<RangeKey>("30d");

  const data = useMemo(() => {
    const source = chartData30[metric];
    return range === "7d" ? source.slice(-5) : source;
  }, [metric, range]);

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-soft md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <DashboardSectionTitle
          title={config.title}
          description={config.description}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="inline-flex rounded-xl border border-border/80 bg-muted/30 p-1">
            {config.metrics.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMetric(item.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  metric === item.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-xl border border-border/80 bg-muted/30 p-1">
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
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  range === item.key
                    ? "bg-foreground text-background shadow-sm"
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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.42 0.18 25)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="oklch(0.42 0.18 25)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0.015 70)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickMargin={8}
              stroke="oklch(0.55 0.02 40)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickMargin={8}
              stroke="oklch(0.55 0.02 40)"
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid oklch(0.9 0.015 70)",
                boxShadow: "0 8px 30px -10px oklch(0.2 0.02 30 / 0.18)",
              }}
              formatter={(value: number) => [value, metricLabels[metric]]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="oklch(0.42 0.18 25)"
              strokeWidth={2.5}
              fill="url(#dashboardArea)"
              dot={false}
              activeDot={{ r: 5, fill: "oklch(0.42 0.18 25)", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
