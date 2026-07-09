import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "@/components/kna/site-chrome";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Download, Receipt, User, Lock, LogOut, ShieldCheck } from "lucide-react";
import { RequireAuth } from "@/lib/auth/protected-route";
import { useAuth } from "@/lib/auth/use-auth";
import { useMe } from "@/hooks/use-account";
import { useLogout } from "@/hooks/use-auth-mutations";

export const Route = createFileRoute("/account")({
  component: () => (
    <RequireAuth>
      <AccountLayout />
    </RequireAuth>
  ),
});

const nav: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}[] = [
  { to: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/account/downloads", label: "My Downloads", icon: Download },
  { to: "/account/orders", label: "Order History", icon: Receipt },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/security", label: "Security", icon: Lock },
];

function AccountLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, isAdminOrAbove } = useAuth();
  // Bootstrap already populated the user via silent refresh; this query
  // keeps it fresh and lets other components re-fetch after a profile edit.
  useMe();
  const logout = useLogout();

  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-10 px-4 py-10 md:px-8 lg:grid-cols-[240px_1fr]">
        <aside>
          <p className="eyebrow">My account</p>
          <p className="mt-2 font-display text-lg">{user?.full_name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <nav className="mt-6 space-y-1">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to as never}
                  className={cn(
                    "flex items-center gap-3 border-l-2 px-3 py-2 text-sm transition",
                    active
                      ? "border-ink bg-paper-warm font-medium text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
            {isAdminOrAbove && (
              <Link
                to="/admin"
                className="flex items-center gap-3 border-l-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition hover:border-border hover:text-foreground"
              >
                <ShieldCheck className="h-4 w-4" /> Admin console
              </Link>
            )}
            <button
              onClick={() => logout.mutate(undefined, { onSuccess: () => navigate({ to: "/" }) })}
              disabled={logout.isPending}
              className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-2 text-sm text-muted-foreground transition hover:border-border hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
