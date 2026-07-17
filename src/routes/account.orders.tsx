import { createFileRoute } from "@tanstack/react-router";
import { orders, formatKES, assets } from "@/lib/mock-data";
import { LicenseBadge, OrderStatusBadge } from "@/components/kna/components";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/account/orders")({
  head: () => ({ meta: [{ title: "Order history — Urithi account" }] }),
  component: OrderHistory,
});

function OrderHistory() {
  return (
    <div>
      <p className="eyebrow">All orders</p>
      <h1 className="mt-2 font-display text-4xl">Order history</h1>

      <div className="mt-8 overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-warm">
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Records</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.number}</TableCell>
                <TableCell className="text-muted-foreground">{o.date}</TableCell>
                <TableCell>{o.items.length}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={o.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatKES(o.total)}
                </TableCell>
                <TableCell className="text-right">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Details <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle className="font-display text-2xl">{o.number}</SheetTitle>
                        <SheetDescription>Placed {o.date}</SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <OrderStatusBadge status={o.status} />
                          <span className="font-display text-2xl tabular-nums">
                            {formatKES(o.total)}
                          </span>
                        </div>
                        {o.items.map((it, i) => {
                          const asset = assets.find((a) => a.id === it.assetId) ?? assets[0];
                          return (
                            <div
                              key={i}
                              className="flex gap-3 border-b border-border pb-4 last:border-b-0"
                            >
                              <div className="h-16 w-20 shrink-0 overflow-hidden bg-ink">
                                <img
                                  src={asset.image}
                                  alt=""
                                  className="bw h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-medium">{it.title}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <LicenseBadge type={it.license} />
                                </div>
                              </div>
                              <p className="text-sm tabular-nums">{formatKES(it.price)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
