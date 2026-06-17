import { useAuth } from "@/lib/auth-context";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function DashboardWelcome() {
  const { user } = useAuth();
  const greeting = getGreeting();
  const firstName = getFirstName(user.name);

  return (
    <section className="rounded-lg border bg-card px-6 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening on your dashboard today.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-UG", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
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
    <div className={className}>
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
