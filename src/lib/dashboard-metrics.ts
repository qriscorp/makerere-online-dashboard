import type { LucideIcon } from "lucide-react";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  CreditCard,
  ClipboardCheck,
  Award,
} from "lucide-react";

import type { KpiAccent } from "@/components/dashboard/kpi-card";
import type {
  ApiDashboardIconKey,
  ApiDashboardOverview,
} from "@/lib/api";

export interface DashboardKpi {
  icon: LucideIcon;
  value: string;
  label: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  breakdown?: string;
  accent: KpiAccent;
}

export interface DashboardSecondaryStat {
  label: string;
  value: string;
  icon: LucideIcon;
}

const ICON_MAP: Record<ApiDashboardIconKey, LucideIcon> = {
  graduation_cap: GraduationCap,
  users: Users,
  book_open: BookOpen,
  dollar_sign: DollarSign,
  calendar: Calendar,
  file_text: FileText,
  trending_up: TrendingUp,
  credit_card: CreditCard,
  clipboard_check: ClipboardCheck,
  award: Award,
};

export function mapDashboardOverview(overview: ApiDashboardOverview): {
  kpis: DashboardKpi[];
  secondaryStats: DashboardSecondaryStat[];
} {
  return {
    kpis: overview.kpis.map((kpi) => ({
      icon: ICON_MAP[kpi.icon],
      value: kpi.value,
      label: kpi.label,
      delta: kpi.delta ?? undefined,
      trend: kpi.trend ?? undefined,
      breakdown: kpi.breakdown ?? undefined,
      accent: kpi.accent,
    })),
    secondaryStats: overview.secondary_stats.map((stat) => ({
      label: stat.label,
      value: stat.value,
      icon: ICON_MAP[stat.icon],
    })),
  };
}
