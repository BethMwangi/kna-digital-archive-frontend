import { createFileRoute, Link } from "@tanstack/react-router";
import { orders, formatKES } from "@/lib/mock-data";
import { OrderStatusBadge } from "@/components/kna/components";
import { Download, Receipt, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/account/")({
  head: () => ({ meta: [{ title: "Overview — My account · Urithi" }] }),
  component: Overview,
});

function Overview() {
  const recent = orders.slice(0, 3);
  return (
    <div>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-2 font-display text-4xl">Overview</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Records licensed" value="18" icon={ShoppingBag} />
        <Stat label="Active downloads" value="6" icon={Download} />
        <Stat label="Lifetime spend" value={formatKES(48200)} icon={Receipt} />
      </div>

      <section className="mt-12">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <h2 className="font-display text-2xl">Recent orders</h2>
          <Link to="/account/orders" className="text-sm underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="mt-4 divide-y divide-border border border-border">
          {recent.map((o) => (
            <div key={o.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-4">
              <div>
                <p className="font-medium">{o.number}</p>
                <p className="text-xs text-muted-foreground">
                  {o.date} · {o.items.length} record{o.items.length > 1 ? "s" : ""}
                </p>
              </div>
              <OrderStatusBadge status={o.status} />
              <p className="tabular-nums font-medium">{formatKES(o.total)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-border bg-paper-warm p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-3 font-display text-3xl">{value}</p>
    </div>
  );
}
