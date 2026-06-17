import type { ApiNotification } from "@/lib/api";
import type { Notification } from "@/lib/types";

export function mapApiNotification(notification: ApiNotification): Notification {
  return {
    id: notification.id,
    userId: notification.user_id,
    title: notification.title,
    message: notification.message,
    category: notification.category,
    isRead: notification.is_read,
    createdAt: notification.created_at,
    linkTo: notification.link_to ?? undefined,
  };
}
