import { createFileRoute } from "@tanstack/react-router";
import { categories } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — KNA Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Taxonomy</p>
          <h1 className="mt-2 font-display text-4xl">Categories</h1>
        </div>
        <Button size="sm" className="rounded-none bg-ink text-paper hover:bg-ink/90"><Plus className="mr-1.5 h-3 w-3" /> New category</Button>
      </div>
      <div className="overflow-hidden border border-border">
        <Table>
          <TableHeader><TableRow className="bg-paper-warm"><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead className="text-right">Assets</TableHead></TableRow></TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">/{c.slug}</TableCell>
                <TableCell className="text-right tabular-nums">{c.count.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  ),
});
