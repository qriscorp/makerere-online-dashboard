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
import type { UserRole } from "@/lib/types";

export interface DashboardKpi {
  icon: LucideIcon;
  value: string;
  label: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  breakdown?: string;
  accent: KpiAccent;
}

export function getDashboardKpis(role: UserRole): DashboardKpi[] {
  switch (role) {
    case "super_admin":
    case "admin":
      return [
        {
          icon: GraduationCap,
          value: "24,812",
          label: "Total students",
          delta: "+12%",
          trend: "up",
          breakdown: "Undergraduate: 18,420 | Postgraduate: 6,392",
          accent: "emerald",
        },
        {
          icon: Users,
          value: "640",
          label: "Active lecturers",
          delta: "+3%",
          trend: "up",
          breakdown: "Full-time: 412 | Part-time: 228",
          accent: "violet",
        },
        {
          icon: BookOpen,
          value: "320",
          label: "Live courses",
          delta: "+8",
          trend: "up",
          breakdown: "STEM: 142 | Business: 98 | Arts: 80",
          accent: "gold",
        },
        {
          icon: DollarSign,
          value: "UGX 184.2M",
          label: "Tuition collected",
          delta: "+18%",
          trend: "up",
          breakdown: "Mobile money: 62% | Bank: 38%",
          accent: "sky",
        },
      ];
    case "lecturer":
      return [
        {
          icon: BookOpen,
          value: "5",
          label: "My courses",
          delta: "+1",
          trend: "up",
          breakdown: "3 undergraduate · 2 postgraduate",
          accent: "crimson",
        },
        {
          icon: GraduationCap,
          value: "428",
          label: "Total students",
          delta: "+24",
          trend: "up",
          breakdown: "Across all assigned course units",
          accent: "emerald",
        },
        {
          icon: Calendar,
          value: "2",
          label: "Upcoming classes",
          breakdown: "Next: Algorithms Q&A · Today 2:00 PM",
          accent: "violet",
        },
        {
          icon: FileText,
          value: "18",
          label: "Pending submissions",
          delta: "3 overdue",
          trend: "down",
          breakdown: "Assessments awaiting grading",
          accent: "gold",
        },
      ];
    case "student":
      return [
        {
          icon: BookOpen,
          value: "6",
          label: "Enrolled courses",
          delta: "+1",
          trend: "up",
          breakdown: "4 in progress · 2 completed",
          accent: "crimson",
        },
        {
          icon: Calendar,
          value: "2",
          label: "Upcoming classes",
          breakdown: "Virtual learning sessions this week",
          accent: "violet",
        },
        {
          icon: CreditCard,
          value: "1",
          label: "Pending payments",
          breakdown: "BSc Computer Science · Intake 2026",
          accent: "gold",
        },
        {
          icon: TrendingUp,
          value: "82%",
          label: "Average grade",
          delta: "+4%",
          trend: "up",
          breakdown: "Based on completed assessments",
          accent: "emerald",
        },
      ];
  }
}

export function getDashboardFocus(role: UserRole): {
  secondaryStats: { label: string; value: string; icon: LucideIcon }[];
} {
  if (role === "student") {
    return {
      secondaryStats: [
        { label: "Certificates earned", value: "2", icon: Award },
        { label: "Assessments due", value: "3", icon: ClipboardCheck },
        { label: "Attendance rate", value: "91%", icon: TrendingUp },
      ],
    };
  }
  if (role === "lecturer") {
    return {
      secondaryStats: [
        { label: "Materials uploaded", value: "47", icon: FileText },
        { label: "Live sessions", value: "6", icon: Calendar },
        { label: "Pass rate", value: "76%", icon: TrendingUp },
      ],
    };
  }
  return {
    secondaryStats: [
      { label: "Active intakes", value: "12", icon: Calendar },
      { label: "Certificates issued", value: "1,248", icon: Award },
      { label: "Platform pass rate", value: "72.5%", icon: TrendingUp },
    ],
  };
}
