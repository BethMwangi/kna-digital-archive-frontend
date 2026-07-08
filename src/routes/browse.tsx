import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import {
  AssetCard,
  EmptyState,
  SearchBar,
} from "@/components/kna/components";
import { assets, categories, collections } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse the archive — Kenya News Agency" },
      { name: "description", content: "Search and filter historical Kenyan photographs, newspapers and records by category, collection, date and photographer." },
    ],
  }),
  component: BrowsePage,
});

const assetTypes = ["Photograph", "Video", "Audio", "PDF", "Newspaper", "Document"];
const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Narok", "Muranga"];
const photographers = ["Mohamed Amin", "Duncan Willetts", "Priya Ramrakha", "David Mutua"];

function BrowsePage() {
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  // TODO(api): GET /api/v1/assets?query&filters
  const results = empty ? [] : [...assets, ...assets].slice(0, 20);

  return (
    <SiteShell>
      <div className="border-b border-border bg-paper-warm">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <p className="eyebrow">Archive · Search</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Browse the archive</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            20,847 catalogued records across five collections.
          </p>
          <div className="mt-6 max-w-3xl">
            <SearchBar
              defaultValue="Kenyatta"
              chips={["Politics", "1960s", "Nairobi", "Editorial license"]}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="space-y-8">
          <FilterGroup title="Keyword">
            <Input placeholder="Refine by keyword" defaultValue="Kenyatta" />
          </FilterGroup>

          <FilterGroup title="Category">
            <div className="space-y-2">
              {categories.slice(0, 6).map((c) => (
                <FilterCheck key={c.id} label={c.name} count={c.count} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Collection">
            <div className="space-y-2">
              {collections.map((c) => (
                <FilterCheck key={c.id} label={c.title} count={c.count} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Asset type">
            <div className="space-y-2">
              {assetTypes.map((t) => (
                <FilterCheck key={t} label={t} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Date range">
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="From" defaultValue="1963" />
              <Input type="number" placeholder="To" defaultValue="2024" />
            </div>
          </FilterGroup>

          <FilterGroup title="Photographer">
            <div className="space-y-2">
              {photographers.map((p) => (
                <FilterCheck key={p} label={p} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="County">
            <div className="space-y-2">
              {counties.slice(0, 5).map((c) => (
                <FilterCheck key={c} label={c} />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {["independence", "kenyatta", "wildlife", "harambee", "olympics"].map((t) => (
                <span key={t} className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs">
                  #{t}
                </span>
              ))}
            </div>
          </FilterGroup>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setLoading(!loading)}>
              {loading ? "Stop loading" : "Preview loading"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEmpty(!empty)}>
              {empty ? "Show results" : "Empty state"}
            </Button>
          </div>
        </aside>

        {/* Results */}
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{results.length}</span> of 2,148 results for{" "}
              <span className="text-foreground">"Kenyatta"</span>
            </p>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Sort</Label>
              <Select defaultValue="relevance">
                <SelectTrigger className="h-8 w-[180px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price-asc">Price · low to high</SelectItem>
                  <SelectItem value="price-desc">Price · high to low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="mt-3 h-4 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title="No records match those filters"
              description="Try broadening the date range or removing a category. Our archivists add new records every week."
              action={
                <Button variant="outline" onClick={() => setEmpty(false)}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((a, i) => (
                  <AssetCard key={a.id + i} asset={a} />
                ))}
              </div>
              <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
                <p className="text-xs text-muted-foreground">Showing 1–20 of 2,148</p>
                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">…</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">108</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </section>
      </div>
    </SiteShell>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </div>
  );
}
function FilterCheck({ label, count }: { label: string; count?: number }) {
  const id = `f-${label}`;
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} />
      <Label htmlFor={id} className="flex flex-1 items-center justify-between text-sm font-normal">
        <span>{label}</span>
        {count && <span className="text-xs text-muted-foreground tabular-nums">{count.toLocaleString()}</span>}
      </Label>
    </div>
  );
}
