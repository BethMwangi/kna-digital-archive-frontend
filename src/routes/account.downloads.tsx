import { createFileRoute } from "@tanstack/react-router";
import { orders } from "@/lib/mock-data";
import { LicenseBadge } from "@/components/kna/components";
import { assets } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/account/downloads")({
  head: () => ({ meta: [{ title: "My downloads — Urithi account" }] }),
  component: Downloads,
});

function Downloads() {
  const items = orders.flatMap((o) => o.items.map((i) => ({ ...i, order: o })));
  return (
    <div>
      <p className="eyebrow">Licensed records</p>
      <h1 className="mt-2 font-display text-4xl">My downloads</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        All watermark-free files you're licensed to use.
      </p>

      <div className="mt-8 overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-warm">
              <TableHead>Record</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Downloads left</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it, i) => {
              const asset = assets.find((a) => a.id === it.assetId) ?? assets[0];
              return (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="watermark-sm h-12 w-16 shrink-0 overflow-hidden bg-ink">
                        <img src={asset.image} alt="" className="bw h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium">{it.title}</p>
                        <p className="text-xs text-muted-foreground">{it.order.number}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <LicenseBadge type={it.license} />
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">{5 - i} of 5</TableCell>
                  <TableCell className="text-sm text-muted-foreground">2026-12-31</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="rounded-none bg-ink text-paper hover:bg-ink/90">
                      <Download className="mr-1.5 h-3 w-3" /> Download
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
