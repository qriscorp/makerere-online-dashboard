import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatRole(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function DashboardWelcome() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const firstName = getFirstName(user.name);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-[oklch(0.97_0.02_75)] p-6 shadow-soft md:p-8">
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-24 h-32 w-32 rounded-full bg-[oklch(0.78_0.14_80)]/10 blur-2xl" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            {formatRole(user.role)} Portal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {greeting},{" "}
            <span className="text-primary">{firstName}</span>
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Welcome back to Makerere Online. Here is a snapshot of your academic activity
            and platform performance today.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <span className="inline-flex items-center rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            {new Date().toLocaleDateString("en-UG", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            Semester active
          </span>
        </div>
      </div>
    </section>
  );
}

interface DashboardSectionTitleProps {
  title: string;
  description?: string;
  className?: string;
}

export function DashboardSectionTitle({
  title,
  description,
  className,
}: DashboardSectionTitleProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
