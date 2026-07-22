import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Layers,
  FolderOpen,
  Users as UsersIcon,
  Receipt,
  BarChart3,
  Settings,
  Bell,
  ChevronsLeft,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RequireAdmin } from "@/lib/auth/protected-route";
import { useAuth } from "@/lib/auth/use-auth";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RequireAdmin>
      <AdminLayout />
    </RequireAdmin>
  ),
});

const roleBadgeLabels: Record<string, string> = {
  admin: "Administrator",
  super_admin: "Super Administrator",
  content_editor: "Content Editor",
  customer: "Customer",
};

function initialsFor(fullName: string | undefined): string {
  if (!fullName) return "";
  return fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const nav: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/assets", label: "Assets", icon: ImageIcon },
  { to: "/admin/categories", label: "Categories", icon: Layers },
  { to: "/admin/collections", label: "Collections", icon: FolderOpen },
  { to: "/admin/users", label: "Users", icon: UsersIcon },
  { to: "/admin/orders", label: "Orders", icon: Receipt },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  return (
    <div className="grid min-h-dvh grid-cols-[auto_1fr] bg-paper-warm">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-ink text-paper transition-[width]",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 border-b border-white/10 p-4",
            collapsed && "justify-center",
          )}
        >
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center bg-paper text-ink font-display text-base"
          >
            U
          </span>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-sm">Urithi Admin</p>
              <p className="text-[0.6rem] uppercase tracking-widest text-paper/50">
                Archive console
              </p>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to as never}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition",
                  active ? "bg-paper text-ink" : "text-paper/75 hover:bg-white/10 hover:text-paper",
                  collapsed && "justify-center px-0",
                )}
                title={n.label}
              >
                <n.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{n.label}</span>}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 border-t border-white/10 p-4 text-xs text-paper/60 hover:text-paper"
        >
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Collapse"}
        </button>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-background px-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search assets, orders, users…" className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-md p-2 hover:bg-muted">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-flag-red" />
            </button>
            <Badge
              variant="outline"
              className="border-flag-red/40 bg-flag-red/5 text-flag-red text-[0.65rem] uppercase tracking-wider"
            >
              {roleBadgeLabels[user?.role ?? ""] ?? user?.role}
            </Badge>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-ink text-paper grid place-items-center text-xs font-medium">
                {initialsFor(user?.full_name)}
              </div>
              <div className="hidden text-xs sm:block">
                <p className="font-medium leading-tight">{user?.full_name}</p>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 bg-background p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
