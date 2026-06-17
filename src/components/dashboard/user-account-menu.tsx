import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { resolveImageUrl } from "@/lib/api";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRole(role: string) {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function UserAvatar({
  name,
  avatar,
  className,
}: {
  name: string;
  avatar?: string;
  className?: string;
}) {
  const avatarUrl = resolveImageUrl(avatar);

  return (
    <Avatar className={cn("h-9 w-9 ring-2 ring-background", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
      <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function AccountMenuItems({
  onNavigate,
  onSignOutRequest,
  showSystemSettings,
}: {
  onNavigate: (path: string) => void;
  onSignOutRequest: () => void;
  showSystemSettings: boolean;
}) {
  return (
    <>
      <DropdownMenuItem
        className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2"
        onClick={() => onNavigate("/dashboard/profile")}
      >
        <User className="h-4 w-4 text-muted-foreground" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2"
        onClick={() =>
          onNavigate(showSystemSettings ? "/dashboard/settings" : "/dashboard/profile")
        }
      >
        <Settings className="h-4 w-4 text-muted-foreground" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-destructive focus:text-destructive"
        onClick={onSignOutRequest}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </DropdownMenuItem>
    </>
  );
}

function SignOutConfirm({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign out"
      description="Are you sure you want to sign out of your account? You will need to sign in again to access the dashboard."
      confirmLabel="Sign out"
      onConfirm={onConfirm}
      destructive
      loading={loading}
    />
  );
}

function useSignOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const requestSignOut = () => setSignOutOpen(true);

  const confirmSignOut = () => {
    setSigningOut(true);
    logout();
    notify.success("Signed out successfully", {
      description: "You have been logged out of your account.",
    });
    navigate("/login");
    setSigningOut(false);
    setSignOutOpen(false);
  };

  return {
    requestSignOut,
    signOutOpen,
    setSignOutOpen,
    confirmSignOut,
    signingOut,
  };
}

interface SidebarUserAccountProps {
  collapsed?: boolean;
}

export function SidebarUserAccount({ collapsed }: SidebarUserAccountProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const showSystemSettings = user.role === "super_admin";
  const {
    requestSignOut,
    signOutOpen,
    setSignOutOpen,
    confirmSignOut,
    signingOut,
  } = useSignOut();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/80 bg-sidebar-accent/20 p-2 text-left transition-all",
              "hover:border-sidebar-border hover:bg-sidebar-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              collapsed && "justify-center p-2",
            )}
          >
            <UserAvatar name={user.name} avatar={user.avatar} className="h-8 w-8" />
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  <span className="mt-1 inline-flex rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {formatRole(user.role)}
                  </span>
                </div>
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={8}
          className="w-64 rounded-xl border border-border/80 p-1.5 shadow-lg"
        >
          <DropdownMenuLabel className="px-2.5 py-2 font-normal">
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} avatar={user.avatar} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <AccountMenuItems
            onNavigate={navigate}
            onSignOutRequest={requestSignOut}
            showSystemSettings={showSystemSettings}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutConfirm
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        onConfirm={confirmSignOut}
        loading={signingOut}
      />
    </>
  );
}

export function HeaderUserAccount() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const showSystemSettings = user.role === "super_admin";
  const {
    requestSignOut,
    signOutOpen,
    setSignOutOpen,
    confirmSignOut,
    signingOut,
  } = useSignOut();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex items-center gap-2.5 rounded-xl border border-border/70 bg-background px-2 py-1.5 text-left transition-all",
              "hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <UserAvatar name={user.name} avatar={user.avatar} className="h-8 w-8" />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold leading-tight">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {formatRole(user.role)}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-60 rounded-xl border border-border/80 p-1.5 shadow-lg"
        >
          <DropdownMenuLabel className="px-2.5 py-2 font-normal">
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} avatar={user.avatar} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <AccountMenuItems
            onNavigate={navigate}
            onSignOutRequest={requestSignOut}
            showSystemSettings={showSystemSettings}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <SignOutConfirm
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        onConfirm={confirmSignOut}
        loading={signingOut}
      />
    </>
  );
}
