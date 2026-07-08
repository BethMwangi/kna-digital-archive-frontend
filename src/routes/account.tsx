import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "@/components/kna/site-chrome";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Download,
  Receipt,
  User,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

const nav: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { to: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/account/downloads", label: "My Downloads", icon: Download },
  { to: "/account/orders", label: "Order History", icon: Receipt },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/security", label: "Security", icon: Lock },
];

function AccountLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-10 px-4 py-10 md:px-8 lg:grid-cols-[240px_1fr]">
        <aside>
          <p className="eyebrow">My account</p>
          <p className="mt-2 font-display text-lg">Wanjiku Kamau</p>
          <p className="text-xs text-muted-foreground">wanjiku@example.co.ke</p>
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
          </nav>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
