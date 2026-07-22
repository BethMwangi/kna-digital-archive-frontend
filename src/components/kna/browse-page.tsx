import { useSearch, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import { AssetCard, EmptyState, SearchBar, type AssetCardData } from "@/components/kna/components";
import {
  useAssets,
  useAssetSearch,
  useCategories,
  useCollections,
  useCounties,
  usePhotographers,
} from "@/hooks/use-assets";
import type { AssetListItem } from "@/lib/api/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { useRef } from "react";

const ASSET_TYPE_OPTIONS = [
  { value: "photograph", label: "Photograph" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "pdf", label: "PDF" },
  { value: "newspaper", label: "Newspaper" },
  { value: "document", label: "Document" },
];
const PAGE_SIZE = 20; // matches the backend's DEFAULT_PAGE_SIZE
const MIN_YEAR = 1900;
const CURRENT_YEAR = new Date().getFullYear();
// Descending — recent decades get filtered far more often than the 1900s.
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i,
);

// Filter params are stored on the URL as a single comma-joined string per
// key (e.g. `?county=Kiambu,Nairobi`) — this is the exact wire format the
// backend's OR-within-a-filter matching expects, so no translation is needed
// between the URL and the API call. These two helpers just manage the
// checkbox-list <-> comma-string conversion for the UI layer.
function parseList(value?: string): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}
function toggleListValue(
  current: string | undefined,
  value: string,
  checked: boolean,
): string | undefined {
  const list = parseList(current);
  const next = checked ? [...list, value] : list.filter((v) => v !== value);
  return next.length ? next.join(",") : undefined;
}

type MultiFilterKey = "category" | "collection" | "asset_type" | "county" | "photographer";

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
  const search = useSearch({ strict: false });
  const navigate = useNavigate({ strict: false });

  const page = search.page || 1;
  const q = search.q;

  const hasQ = Boolean(q);
  const filterParams = {
    category: search.category,
    collection: search.collection,
    asset_type: search.asset_type,
    county: search.county,
    photographer: search.photographer,
    date_from: search.date_from,
    date_to: search.date_to,
  };
  const assetsQuery = useAssets({ page, ...filterParams });
  const searchQuery = useAssetSearch({ page, q: q || "", ...filterParams });

  const { data, isPending, isError, isFetching } = hasQ ? searchQuery : assetsQuery;
  // "fuzzy" means the literal query matched nothing and this is a
  // typo-corrected best guess — worth telling the user why results differ
  // from what they typed.
  const fuzzyMatch = hasQ && searchQuery.data?.match_type === "fuzzy";

  const { data: categoriesData } = useCategories();
  const { data: collectionsData } = useCollections();
  const { data: countiesData } = useCounties();
  const { data: photographersData } = usePhotographers();

  const categoryParams = parseList(search.category);
  const collectionParams = parseList(search.collection);
  const assetTypeParams = parseList(search.asset_type);
  const countyParams = parseList(search.county);
  const photographerParams = parseList(search.photographer);

  const fromYear = search.date_from ? Number(search.date_from.slice(0, 4)) : undefined;
  const toYear = search.date_to ? Number(search.date_to.slice(0, 4)) : undefined;

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
    navigate({ search: (prev) => ({ ...prev, page: next }) });
    resultsRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  // Every filter param is comma-joined on the URL and OR's within itself;
  // different filter keys still AND together (handled server-side).
  function toggleFilter(key: MultiFilterKey, value: string, checked: boolean) {
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: toggleListValue(prev[key], value, checked),
        page: 1,
      }),
    });
  }

  function setYearRange(nextFrom: number | undefined, nextTo: number | undefined) {
    navigate({
      search: (prev) => ({
        ...prev,
        date_from: nextFrom ? `${nextFrom}-01-01` : undefined,
        date_to: nextTo ? `${nextTo}-12-31` : undefined,
        page: 1,
      }),
    });
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
            <SearchBar defaultValue={q} chips={[]} />
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <aside className="space-y-8">
          <FilterGroup title="Category">
            <div className="space-y-2">
              {categoriesData?.slice(0, 6).map((c) => (
                <FilterCheck
                  key={c.id}
                  label={c.name}
                  count={c.count}
                  checked={categoryParams.includes(c.id)}
                  onCheckedChange={(checked) => toggleFilter("category", c.id, checked)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Collection">
            <div className="space-y-2">
              {collectionsData?.slice(0, 6).map((c) => (
                <FilterCheck
                  key={c.id}
                  label={c.name}
                  count={c.count}
                  checked={collectionParams.includes(c.id)}
                  onCheckedChange={(checked) => toggleFilter("collection", c.id, checked)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Asset type">
            <div className="space-y-2">
              {ASSET_TYPE_OPTIONS.map((t) => (
                <FilterCheck
                  key={t.value}
                  label={t.label}
                  checked={assetTypeParams.includes(t.value)}
                  onCheckedChange={(checked) => toggleFilter("asset_type", t.value, checked)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="Year">
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={fromYear ? String(fromYear) : "any"}
                onValueChange={(v) => setYearRange(v === "any" ? undefined : Number(v), toYear)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="any">From</SelectItem>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={toYear ? String(toYear) : "any"}
                onValueChange={(v) => setYearRange(fromYear, v === "any" ? undefined : Number(v))}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="any">To</SelectItem>
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(fromYear || toYear) && (
              <button
                onClick={() => setYearRange(undefined, undefined)}
                className="mt-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Clear year filter
              </button>
            )}
          </FilterGroup>

          <FilterGroup title="Photographer">
            <div className="space-y-2">
              {photographersData?.slice(0, 6).map((p) => (
                <FilterCheck
                  key={p.name}
                  label={p.name}
                  count={p.count}
                  checked={photographerParams.includes(p.name)}
                  onCheckedChange={(checked) => toggleFilter("photographer", p.name, checked)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="County">
            <div className="space-y-2">
              {countiesData?.slice(0, 8).map((c) => (
                <FilterCheck
                  key={c.name}
                  label={c.name}
                  count={c.count}
                  checked={countyParams.includes(c.name)}
                  onCheckedChange={(checked) => toggleFilter("county", c.name, checked)}
                />
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
          {fuzzyMatch && (
            <p className="mb-4 text-sm text-muted-foreground">
              No exact match for <span className="font-medium text-foreground">"{q}"</span> —
              showing results for{" "}
              <span className="font-medium text-foreground">"{searchQuery.data?.query}"</span>{" "}
              instead.
            </p>
          )}
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
function FilterCheck({
  label,
  count,
  checked,
  onCheckedChange,
}: {
  label: string;
  count?: number;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const id = `f-${label}`;
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
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
