import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import type { Notification, NotificationCategory } from "@/lib/types";
import { api } from "@/lib/api";
import { mapApiNotification } from "@/lib/notification-utils";
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getCategoryBadge(category: NotificationCategory) {
  switch (category) {
    case "enrollment":
      return (
        <Badge className="border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100">
          Enrollment
        </Badge>
      );
    case "payment":
      return (
        <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
          Payment
        </Badge>
      );
    case "class":
      return (
        <Badge className="border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100">
          Class
        </Badge>
      );
    case "exam":
      return (
        <Badge className="border-transparent bg-orange-100 text-orange-800 hover:bg-orange-100">
          Exam
        </Badge>
      );
  }
}

export default function DashboardNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { refreshUnreadCount } = useNotifications();
  const isStudent = user.role === "student";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);
      try {
        const data = await api.getNotifications();
        if (!cancelled) {
          setNotifications(data.map(mapApiNotification));
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load notifications";
          toast.error("Could not load notifications", { description: message });
          setNotifications([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isStudent) return;

    let cancelled = false;

    async function showUpcomingAlerts() {
      try {
        const alerts = await api.getUpcomingAlerts();
        if (cancelled) return;

        alerts.exam_deadlines.forEach((exam) => {
          toast.warning("Exam deadline approaching!", {
            description: `"${exam.title}" is due in ${exam.hours_left} hour${exam.hours_left !== 1 ? "s" : ""}`,
            duration: 8000,
          });
        });

        alerts.upcoming_classes.forEach((cls) => {
          toast.info("Live class starting soon!", {
            description: `"${cls.title}" starts in ${cls.minutes_left} minute${cls.minutes_left !== 1 ? "s" : ""}`,
            duration: 10000,
          });
        });
      } catch {
        // Alerts are optional; ignore failures.
      }
    }

    void showUpcomingAlerts();
    return () => {
      cancelled = true;
    };
  }, [isStudent]);

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((n) => n.category === categoryFilter);
    }

    if (readFilter === "read") {
      filtered = filtered.filter((n) => n.isRead);
    } else if (readFilter === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    }

    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [notifications, categoryFilter, readFilter]);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) {
      if (notification.linkTo) {
        navigate(notification.linkTo);
      }
      return;
    }

    try {
      const updated = await api.markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? mapApiNotification(updated) : n,
        ),
      );
      await refreshUnreadCount();
      if (notification.linkTo) {
        navigate(notification.linkTo);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update notification";
      toast.error("Could not mark as read", { description: message });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await refreshUnreadCount();
      toast.success("All notifications marked as read");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to mark all as read";
      toast.error("Could not update notifications", { description: message });
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Stay updated with your latest notifications.">
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="enrollment">Enrollment</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="class">Class</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
          </SelectContent>
        </Select>

        <Select value={readFilter} onValueChange={setReadFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-8 text-muted-foreground shadow-soft">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground shadow-soft">
            <p>No notifications found.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`cursor-pointer rounded-2xl border border-border bg-card p-4 shadow-soft transition-colors hover:bg-muted/50 ${
                !notification.isRead ? "border-l-4 border-l-primary" : ""
              }`}
              onClick={() => void handleMarkAsRead(notification)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!notification.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <p
                      className={`text-sm ${!notification.isRead ? "font-semibold" : "font-medium"}`}
                    >
                      {notification.title}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getCategoryBadge(notification.category)}
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {format(new Date(notification.createdAt), "MMM d, yyyy HH:mm")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
