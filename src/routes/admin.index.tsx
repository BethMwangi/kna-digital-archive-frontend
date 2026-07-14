import { createFileRoute } from "@tanstack/react-router";
import { orders, assets, formatKES } from "@/lib/mock-data";
import { OrderStatusBadge } from "@/components/kna/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Urithi Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Q4 · Week 44</p>
        <h1 className="mt-2 font-display text-4xl">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Revenue" value={formatKES(1842000)} delta="+12.4%" up />
        <Stat label="Orders" value="384" delta="+6.1%" up />
        <Stat label="Downloads" value="2,914" delta="+18.9%" up />
        <Stat label="New users" value="71" delta="-2.3%" up={false} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="flex items-end justify-between border-b border-border pb-3">
            <h2 className="font-display text-2xl">Recent orders</h2>
            <a className="text-sm underline underline-offset-4">View all</a>
          </div>
          <div className="mt-4 overflow-hidden border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-paper-warm">
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <p className="font-medium">{o.number}</p>
                      <p className="text-xs text-muted-foreground">{o.date}</p>
                    </TableCell>
                    <TableCell className="text-sm">Wanjiku Kamau</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatKES(o.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between border-b border-border pb-3">
            <h2 className="font-display text-2xl">Top-selling assets</h2>
          </div>
          <ol className="mt-4 space-y-4">
            {assets.slice(0, 5).map((a, i) => (
              <li key={a.id} className="flex items-center gap-3">
                <span className="font-display text-xl text-muted-foreground w-6 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="watermark h-12 w-16 shrink-0 overflow-hidden bg-ink">
                  <img src={a.image} alt="" className="bw h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.year} · {a.category}
                  </p>
                </div>
                <p className="tabular-nums text-sm font-medium">
                  {formatKES(a.priceFrom * (30 - i * 4))}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  up,
}: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
}) {
  return (
    <div className="border border-border bg-background p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 font-display text-3xl tabular-nums">{value}</p>
      <p
        className={cn(
          "mt-2 inline-flex items-center gap-1 text-xs font-medium",
          up ? "text-[oklch(0.4_0.14_150)]" : "text-flag-red",
        )}
      >
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {delta}
        <ArrowUpRight className="ml-1 h-3 w-3 text-muted-foreground" />
      </p>
    </div>
  );
}
