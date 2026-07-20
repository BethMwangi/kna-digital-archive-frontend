import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import { AssetCard, EmptyState, SearchBar, type AssetCardData } from "@/components/kna/components";
import { categories, collections } from "@/lib/mock-data";
import { useAssets } from "@/hooks/use-assets";
import type { AssetListItem } from "@/lib/api/types";
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
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => {
    return {
      q: search.q as string | undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Browse the archive — Urithi" },
      {
        name: "description",
        content:
          "Search and filter historical Kenyan photographs, newspapers and records by category, collection, date and photographer.",
      },
    ],
  }),
  component: BrowsePage,
});

const assetTypes = ["Photograph", "Video", "Audio", "PDF", "Newspaper", "Document"];
const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Narok", "Muranga"];
const photographers = ["Mohamed Amin", "Duncan Willetts", "Priya Ramrakha", "David Mutua"];
const PAGE_SIZE = 20; // matches the backend's DEFAULT_PAGE_SIZE

// Backend has no slug field yet — route by id (see src/lib/api/assets.ts).
function toCard(a: AssetListItem): AssetCardData {
  return {
    id: a.id,
    slug: a.id,
    title: a.title,
    image: a.thumbnail,
    year: a.publication_date?.slice(0, 4) ?? a.created_at.slice(0, 4),
    category: a.category?.name ?? "Uncategorised",
  };
}

export function BrowsePage() {
  const { q } = Route.useSearch();
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isFetching } = useAssets({ page, search: q });
  const results = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const resultsRef = useRef<HTMLElement>(null);

  // useAssets keeps the previous page's data visible while the next page
  // loads (keepPreviousData) — isPending stays false, so without this the
  // grid would silently sit on stale content with zero feedback for
  // however long the request takes (a slow/cold backend can make that look
  // completely broken). isFetching stays true for that whole window.
  function goToPage(next: number) {
    setPage(next);
    resultsRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  return (
    <SiteShell>
      <div className="border-b border-border bg-paper-warm">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <p className="eyebrow">Archive · Search</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Browse the archive</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            {total.toLocaleString()} catalogued records in the archive.
          </p>
          <div className="mt-6 max-w-3xl">
            <SearchBar
              defaultValue={q ?? ""}
              chips={["Politics", "1960s", "Nairobi", "Editorial license"]}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="space-y-8">
          <FilterGroup title="Keyword">
            <Input
              placeholder="Refine by keyword"
              defaultValue={q ?? ""}
            />
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
                <span
                  key={t}
                  className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs"
                >
                  #{t}
                </span>
              ))}
            </div>
          </FilterGroup>
        </aside>

        {/* Results */}
        <section ref={resultsRef}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{total.toLocaleString()}</span> records
              in the archive
              {isFetching && !isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
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

          {isPending ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/3] w-full" />
                  <Skeleton className="mt-3 h-4 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="Couldn't load the archive"
              description="Something went wrong reaching the server. Try refreshing the page."
            />
          ) : results.length === 0 ? (
            <EmptyState
              title="No records match those filters"
              description="Try broadening the date range or removing a category. Our archivists add new records every week."
            />
          ) : (
            <>
              <div
                className={
                  isFetching
                    ? "grid gap-8 opacity-50 transition-opacity sm:grid-cols-2 lg:grid-cols-3"
                    : "grid gap-8 transition-opacity sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {results.map((a) => (
                  <AssetCard key={a.id} asset={toCard(a)} />
                ))}
              </div>
              <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + results.length} of{" "}
                  {total.toLocaleString()}
                </p>
                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        aria-disabled={page <= 1 || isFetching}
                        className={
                          page <= 1 || isFetching ? "pointer-events-none opacity-50" : undefined
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) goToPage(page - 1);
                        }}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        aria-disabled={page >= totalPages || isFetching}
                        className={
                          page >= totalPages || isFetching
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) goToPage(page + 1);
                        }}
                      />
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
        {count && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {count.toLocaleString()}
          </span>
        )}
      </Label>
    </div>
  );
}
