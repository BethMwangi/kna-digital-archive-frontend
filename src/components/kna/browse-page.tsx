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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

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

type MultiFilterKey = "category" | "collection" | "county" | "photographer";

// Backend has no slug field yet — route by id (see src/lib/api/assets.ts).
function toCard(a: AssetListItem): AssetCardData {
  return {
    id: a.id,
    slug: a.id,
    title: a.title,
    image: a.thumbnail,
    year: a.publication_date?.slice(0, 4) ?? a.created_at.slice(0, 4),
    category: a.category?.name ?? "Uncategorised",
    priceFrom: a.price,
  };
}

const TAG_STYLES = [
  "bg-flag-red-soft text-flag-red",
  "bg-flag-green-soft text-flag-green",
  "bg-ink text-paper",
];

type PageToken = number | "ellipsis";

// Always shows page 1, the last page, and a window around the current page —
// collapsing everything else into a single "…". A one-page gap is filled in
// directly rather than replaced with an ellipsis (nicer than "1 … 3").
function getPageNumbers(current: number, total: number): PageToken[] {
  const delta = 1;
  const shown = new Set<number>();
  shown.add(1);
  shown.add(total);
  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= 1 && i <= total) shown.add(i);
  }
  const sorted = [...shown].sort((a, b) => a - b);

  const tokens: PageToken[] = [];
  let prev = 0;
  for (const page of sorted) {
    if (prev) {
      if (page - prev === 2) tokens.push(prev + 1);
      else if (page - prev > 2) tokens.push("ellipsis");
    }
    tokens.push(page);
    prev = page;
  }
  return tokens;
}

export function BrowsePage() {
  return (
    <SiteShell>
      <ArchiveBrowser to="/browse" headingLevel="h1" />
    </SiteShell>
  );
}

/**
 * The shoppable archive: banner with search + quick category chips, filter
 * sidebar, product grid and pagination. Rendered on the home page (below the
 * hero) and on /browse — filters live on whichever page's URL hosts it.
 */
export function ArchiveBrowser({
  to,
  headingLevel = "h2",
  id,
}: {
  to: "/" | "/browse";
  headingLevel?: "h1" | "h2";
  id?: string;
}) {
  const Heading = headingLevel;
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
  const fuzzyMatch = hasQ && searchQuery.data?.match_type === "fuzzy";

  const { data: categoriesData } = useCategories();
  const { data: collectionsData } = useCollections();
  const { data: countiesData } = useCounties();
  const { data: photographersData } = usePhotographers();

  const categoryParams = parseList(search.category);
  const collectionParams = parseList(search.collection);
  const countyParams = parseList(search.county);
  const photographerParams = parseList(search.photographer);

  const fromYear = search.date_from ? Number(search.date_from.slice(0, 4)) : undefined;
  const toYear = search.date_to ? Number(search.date_to.slice(0, 4)) : undefined;

  const results = data?.results ?? [];
  const total = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const resultsRef = useRef<HTMLElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // useAssets keeps the previous page's data visible while the next page
  // loads (keepPreviousData) — isPending stays false, so without this the
  // grid would silently sit on stale content with zero feedback for
  // however long the request takes (a slow/cold backend can make that look
  // completely broken). isFetching stays true for that whole window.
  function goToPage(next: number) {
    navigate({ search: (prev) => ({ ...prev, page: next }) });
    scrollToResults();
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

  const topCategories = [...(categoriesData ?? [])]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 6);

  function scrollToResults() {
    resultsRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }

  return (
    <div id={id} className="scroll-mt-20">
      {/* Shop banner — deep Kenyan green with red/black glow and a flag rule */}
      <div className="relative overflow-hidden bg-flag-green-deep text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-flag-red/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-flag-green/60 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow !text-paper/75">Archive · Shop</p>
              <Heading className="mt-2 font-display text-4xl md:text-5xl">
                Browse the archive
              </Heading>
              <p className="mt-3 max-w-2xl text-sm text-paper/80">
                <span className="font-semibold text-paper">{total.toLocaleString()}</span>{" "}
                catalogued records ready to license and download.
              </p>
            </div>
          </div>
          <div className="mt-6 max-w-3xl">
            <SearchBar
              to={to}
              defaultValue={q}
              chips={[]}
              onSearch={scrollToResults}
              className="rounded-full border-transparent px-2 shadow-lg"
              action={
                <Button
                  type="submit"
                  className="shrink-0 rounded-full bg-flag-red text-paper hover:bg-flag-red/90"
                >
                  <SearchIcon className="mr-1.5 h-4 w-4" /> Search
                </Button>
              }
            />
          </div>
          {topCategories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {topCategories.map((c) => {
                const active = categoryParams.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleFilter("category", c.id, !active)}
                    aria-pressed={active}
                    className={
                      active
                        ? "rounded-full border border-flag-red bg-flag-red px-3.5 py-1.5 text-xs font-semibold text-paper"
                        : "rounded-full border border-paper/30 bg-paper/10 px-3.5 py-1.5 text-xs font-medium text-paper backdrop-blur transition hover:border-paper hover:bg-paper/20"
                    }
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div aria-hidden className="relative flex h-1.5 w-full">
          <span className="flex-1 bg-ink" />
          <span className="w-1 bg-paper" />
          <span className="flex-1 bg-flag-red" />
          <span className="w-1 bg-paper" />
          <span className="flex-1 bg-flag-green" />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:px-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        {/* Filters */}
        {/* On small screens filters collapse behind a toggle so products show first */}
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          className="flex items-center justify-between rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper lg:hidden"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </span>
          <span className="text-xs text-paper/70">{filtersOpen ? "Hide" : "Show"}</span>
        </button>
        <aside
          className={`${filtersOpen ? "block" : "hidden"} h-fit space-y-6 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border lg:sticky lg:top-28 lg:block`}
        >
          <FilterGroup title="Category" accent="bg-flag-red">
            <FilterCheckList
              items={categoriesData}
              limit={6}
              getKey={(c) => c.id}
              getLabel={(c) => c.name}
              getCount={(c) => c.count}
              checked={(c) => categoryParams.includes(c.id)}
              onCheckedChange={(c, checked) => toggleFilter("category", c.id, checked)}
            />
          </FilterGroup>

          <FilterGroup title="Collection" accent="bg-flag-green">
            <FilterCheckList
              items={collectionsData}
              limit={6}
              getKey={(c) => c.id}
              getLabel={(c) => c.name}
              getCount={(c) => c.count}
              checked={(c) => collectionParams.includes(c.id)}
              onCheckedChange={(c, checked) => toggleFilter("collection", c.id, checked)}
            />
          </FilterGroup>

          <FilterGroup title="Year" accent="bg-ink">
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

          <FilterGroup title="Photographer" accent="bg-flag-red">
            <FilterCheckList
              items={photographersData}
              limit={6}
              getKey={(p) => p.name}
              getLabel={(p) => p.name}
              getCount={(p) => p.count}
              checked={(p) => photographerParams.includes(p.name)}
              onCheckedChange={(p, checked) => toggleFilter("photographer", p.name, checked)}
            />
          </FilterGroup>

          <FilterGroup title="County" accent="bg-flag-green">
            <FilterCheckList
              items={countiesData}
              limit={8}
              getKey={(c) => c.name}
              getLabel={(c) => c.name}
              getCount={(c) => c.count}
              checked={(c) => countyParams.includes(c.name)}
              onCheckedChange={(c, checked) => toggleFilter("county", c.name, checked)}
            />
          </FilterGroup>

          <FilterGroup title="Tags" accent="bg-ink">
            <div className="flex flex-wrap gap-1.5">
              {["independence", "kenyatta", "wildlife", "harambee", "olympics"].map((t, i) => (
                <span
                  key={t}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TAG_STYLES[i % TAG_STYLES.length]}`}
                >
                  #{t}
                </span>
              ))}
            </div>
          </FilterGroup>
        </aside>

        {/* Results */}
        <section ref={resultsRef} className="scroll-mt-28">
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
              <span className="rounded-full bg-flag-red-soft px-2.5 py-0.5 font-semibold text-flag-red tabular-nums">
                {total.toLocaleString()}
              </span>{" "}
              records in the archive
              {isFetching && !isPending && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </p>
          </div>

          {isPending ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl ring-1 ring-border">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="mt-3 h-4 w-2/3" />
                    <Skeleton className="mt-4 h-6 w-1/2" />
                  </div>
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
              <div className="relative">
                <div
                  className={
                    isFetching
                      ? "grid gap-6 opacity-40 transition-opacity sm:grid-cols-2 xl:grid-cols-3"
                      : "grid gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3"
                  }
                >
                  {results.map((a) => (
                    <AssetCard key={a.id} asset={toCard(a)} />
                  ))}
                </div>
                {isFetching && (
                  <div className="absolute inset-0 flex items-start justify-center pt-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
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
                    {getPageNumbers(page, totalPages).map((token, i) =>
                      token === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={token}>
                          <PaginationLink
                            href="#"
                            isActive={token === page}
                            aria-disabled={isFetching}
                            className={isFetching ? "pointer-events-none opacity-50" : undefined}
                            onClick={(e) => {
                              e.preventDefault();
                              if (token !== page) goToPage(token);
                            }}
                          >
                            {token}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    )}
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
    </div>
  );
}

function FilterGroup({
  title,
  accent,
  children,
}: {
  title: string;
  /** Tailwind bg class for the flag-colour marker beside the heading. */
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border pb-5 last:border-b-0 last:pb-0">
      <h3 className="eyebrow mb-3 flex items-center gap-2 !text-foreground">
        <span aria-hidden className={`h-3 w-1 rounded-full ${accent}`} />
        {title}
      </h3>
      {children}
    </div>
  );
}
/** Truncates a filter's options to `limit` with a "Show all"/"Show less" toggle,
 *  instead of silently dropping every option past a fixed cutoff. */
function FilterCheckList<T>({
  items,
  limit,
  getKey,
  getLabel,
  getCount,
  checked,
  onCheckedChange,
}: {
  items: T[] | undefined;
  limit: number;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  getCount?: (item: T) => number | undefined;
  checked: (item: T) => boolean;
  onCheckedChange: (item: T, checked: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const all = items ?? [];
  const visible = expanded ? all : all.slice(0, limit);

  return (
    <div className="space-y-2">
      {visible.map((item) => (
        <FilterCheck
          key={getKey(item)}
          label={getLabel(item)}
          count={getCount?.(item)}
          checked={checked(item)}
          onCheckedChange={(next) => onCheckedChange(item, next)}
        />
      ))}
      {all.length > limit && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {expanded ? "Show less" : `Show all (${all.length})`}
        </button>
      )}
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
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="border-flag-green/60 data-[state=checked]:border-flag-green data-[state=checked]:bg-flag-green"
      />
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
