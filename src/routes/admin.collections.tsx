import { createFileRoute } from "@tanstack/react-router";
import { collections } from "@/lib/mock-data";
import { CollectionCard } from "@/components/kna/components";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/collections")({
  head: () => ({ meta: [{ title: "Collections — KNA Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Curation</p>
          <h1 className="mt-2 font-display text-4xl">Collections</h1>
        </div>
        <Button size="sm" className="rounded-none bg-ink text-paper hover:bg-ink/90"><Plus className="mr-1.5 h-3 w-3" /> New collection</Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => <CollectionCard key={c.id} collection={c} />)}
      </div>
    </div>
  ),
});
