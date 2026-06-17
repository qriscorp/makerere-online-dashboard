import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { getNavigationItems } from "@/lib/navigation";
import { mockNotifications } from "@/lib/mock-data";
import { SidebarUserAccount } from "@/components/dashboard/user-account-menu";
import makereLogo from "@/assets/makerere-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const { pathname } = useLocation();
  const navGroups = getNavigationItems(user.role);
  const isCollapsed = state === "collapsed";

  // Count unread notifications for the current user
  const unreadCount = mockNotifications.filter(
    (n) => n.userId === user.id && !n.isRead,
  ).length;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <img
            src={makereLogo}
            alt="Makerere University Logo"
            className="h-8 w-8 shrink-0 rounded"
          />
          {!isCollapsed && (
            <span className="text-sm font-semibold truncate">
              Makerere Online
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const isNotifications = item.href === "/dashboard/notifications";
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {isNotifications && unreadCount > 0 && (
                      <SidebarMenuBadge>{unreadCount}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarUserAccount collapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
