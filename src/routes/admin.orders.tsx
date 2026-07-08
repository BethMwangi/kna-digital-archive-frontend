import { createFileRoute } from "@tanstack/react-router";
import { orders, formatKES } from "@/lib/mock-data";
import { OrderStatusBadge } from "@/components/kna/components";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — KNA Admin" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const rows = [...orders, ...orders].slice(0, 8);
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Transactions</p>
        <h1 className="mt-2 font-display text-4xl">Orders</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 border border-border bg-paper-warm p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by order number, email…" className="pl-9 bg-background" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px] bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Pending", "Paid", "Cancelled", "Refunded", "Completed"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="30">
          <SelectTrigger className="w-[160px] bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-warm">
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((o, i) => (
              <TableRow key={o.id + i}>
                <TableCell className="font-medium">{o.number}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{o.date}</TableCell>
                <TableCell className="text-sm">wanjiku@example.co.ke</TableCell>
                <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                <TableCell className="text-right tabular-nums font-medium">{formatKES(o.total)}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-flag-red border-flag-red/30 hover:bg-flag-red/5">Refund</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display text-2xl">Refund {o.number}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reverse the full amount ({formatKES(o.total)}) to the customer's original payment method and revoke all associated download rights.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-flag-red hover:bg-flag-red/90">Confirm refund</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
