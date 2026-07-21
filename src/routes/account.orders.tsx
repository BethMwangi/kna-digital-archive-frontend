import { createFileRoute } from "@tanstack/react-router";
import { formatKES } from "@/lib/mock-data";
import { useOrders } from "@/hooks/use-orders";
import { LazyImage, LicenseBadge, OrderStatusBadge } from "@/components/kna/components";
import type { OrderStatus } from "@/lib/mock-data";
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
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/kna/components";
import { ChevronRight, Receipt } from "lucide-react";

export const Route = createFileRoute("/account/orders")({
  head: () => ({ meta: [{ title: "Order history — Urithi account" }] }),
  component: OrderHistory,
});

function toDisplayStatus(status: string): OrderStatus {
  return (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) as OrderStatus;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function OrderHistory() {
  const { data: orders, isPending, isError } = useOrders();

  return (
    <div>
      <p className="eyebrow">All orders</p>
      <h1 className="mt-2 font-display text-4xl">Order history</h1>

      {isPending ? (
        <div className="mt-8 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <p className="mt-8 text-sm text-destructive">
          Couldn't load your orders. Please try again.
        </p>
      ) : orders && orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Receipt className="h-5 w-5" />}
            title="No orders yet"
            description="Your licensed records will show up here once you make a purchase."
          />
        </div>
      ) : (
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
              {orders?.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.order_number}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(o.created_at)}
                  </TableCell>
                  <TableCell>{o.item_count}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={toDisplayStatus(o.status)} />
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
                          <SheetTitle className="font-display text-2xl">
                            {o.order_number}
                          </SheetTitle>
                          <SheetDescription>Placed {formatDate(o.created_at)}</SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <OrderStatusBadge status={toDisplayStatus(o.status)} />
                            <span className="font-display text-2xl tabular-nums">
                              {formatKES(o.total)}
                            </span>
                          </div>
                          {o.items.map((it) => (
                            <div
                              key={it.id}
                              className="flex gap-3 border-b border-border pb-4 last:border-b-0"
                            >
                              <LazyImage
                                src={it.asset.thumbnail}
                                alt=""
                                containerClassName="h-16 w-20 shrink-0"
                                className="bw"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm font-medium">
                                  {it.asset_title_snapshot}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <LicenseBadge type={it.license.name as never} />
                                </div>
                              </div>
                              <p className="text-sm tabular-nums">
                                {formatKES(it.price_at_purchase)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
