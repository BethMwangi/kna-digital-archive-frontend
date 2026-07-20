import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { LicenseType, OrderStatus } from "@/lib/mock-data";
import { formatKES } from "@/lib/mock-data";
import { Search, X, ZoomIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/* ---------- Archival preview image ---------- */
/** Real images (and slow connections) can take a couple of seconds — show a
 *  skeleton until the image actually loads instead of a blank/broken flash. */
export function PreviewImage({
  src,
  alt,
  className,
  aspect = "aspect-[4/3]",
  zoomable = false,
}: {
  src: string;
  alt: string;
  className?: string;
  aspect?: string;
  /** Adds a zoom button that opens the image full-size in a lightbox. */
  zoomable?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-ink", aspect, className)}>
      {!loaded && <Skeleton className="absolute inset-0" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "bw h-full w-full object-cover transition-[opacity,transform] duration-[900ms] ease-out group-hover:scale-[1.04]",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
      {zoomable && (
        <>
          <button
            type="button"
            aria-label="Zoom preview"
            onClick={() => setOpen(true)}
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center bg-ink/80 text-paper hover:bg-ink"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
              <DialogTitle className="sr-only">{alt}</DialogTitle>
              <img src={src} alt={alt} className="max-h-[85vh] w-full object-contain" />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

/* ---------- AssetCard ---------- */
/**
 * Loosened beyond the mock `Asset` shape so real API assets (no slug/price
 * yet — see src/lib/api/assets.ts) can render here too; only `priceFrom` is
 * optionalp so the price block can be omitted for them.
 */
export interface AssetCardData {
  id: string;
  slug: string;
  title: string;
  image: string;
  year: string | number;
  category: string;
  priceFrom?: number;
}

export function AssetCard({ asset }: { asset: AssetCardData }) {
  return (
    <Link
      to="/asset/$slug"
      params={{ slug: asset.slug }}
      className="group block focus:outline-none"
    >
      <PreviewImage src={asset.image} alt={asset.title} />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{asset.year}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{asset.category}</span>
          </div>
          <h3 className="mt-1 line-clamp-2 font-display text-[1.05rem] leading-snug text-foreground group-hover:underline underline-offset-4 decoration-1">
            {asset.title}
          </h3>
        </div>
        {typeof asset.priceFrom === "number" && (
          <div className="shrink-0 text-right">
            <p className="eyebrow !text-[0.6rem]">From</p>
            <p className="font-medium tabular-nums">{formatKES(asset.priceFrom)}</p>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ---------- CategoryPill ---------- */
export function CategoryPill({
  name,
  count,
  active = false,
  as: As = "a",
  href = "#",
}: {
  name: string;
  count?: number;
  active?: boolean;
  as?: "a" | "button";
  href?: string;
}) {
  const cls = cn(
    "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition",
    active
      ? "border-ink bg-ink text-paper"
      : "border-border bg-background hover:border-foreground/60",
  );
  const content = (
    <>
      <span>{name}</span>
      {typeof count === "number" && (
        <span className={cn("tabular-nums", active ? "text-paper/70" : "text-muted-foreground")}>
          {count.toLocaleString()}
        </span>
      )}
    </>
  );
  if (As === "button") return <button className={cls}>{content}</button>;
  return (
    <a href={href} className={cls}>
      {content}
    </a>
  );
}

/* ---------- CollectionCard ---------- */
/** Loosened beyond the mock `Collection` shape so real API collections
 *  (no count/blurb yet — see src/lib/api/assets.ts) can render here too. */
export interface CollectionCardData {
  id: string;
  title: string;
  cover: string;
  count?: number;
  blurb?: string;
}

export function CollectionCard({ collection }: { collection: CollectionCardData }) {
  return (
    <Link to="/browse" className="group relative block overflow-hidden aspect-[4/5]">
      <img
        src={collection.cover}
        alt={collection.title}
        loading="lazy"
        className="bw h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
        <p className="eyebrow !text-paper/70">
          Collection
          {typeof collection.count === "number" && ` · ${collection.count.toLocaleString()} assets`}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-tight">{collection.title}</h3>
        {collection.blurb && (
          <p className="mt-1 text-sm text-paper/80 line-clamp-2">{collection.blurb}</p>
        )}
      </div>
    </Link>
  );
}

/* ---------- LicenseBadge ---------- */
const licenseStyles: Record<LicenseType, string> = {
  Editorial: "border-foreground/30 text-foreground",
  Commercial: "border-primary/40 text-primary bg-primary/5",
  Educational:
    "border-[oklch(0.55_0.14_150)]/40 text-[oklch(0.4_0.14_150)] bg-[oklch(0.55_0.14_150)]/5",
  Government: "border-flag-red/40 text-flag-red bg-flag-red/5",
  "Internal Use": "border-muted-foreground/30 text-muted-foreground",
};
export function LicenseBadge({ type }: { type: LicenseType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[0.7rem] font-medium uppercase tracking-wider",
        licenseStyles[type],
      )}
    >
      <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
      {type}
    </span>
  );
}

/* ---------- SearchBar ---------- */
export function SearchBar({
  size = "md",
  chips = [],
  defaultValue,
  action,
  placeholder = "Search the archive — subject, county, photographer, year...",
}: {
  size?: "md" | "lg";
  chips?: string[];
  defaultValue?: string;
  action?: React.ReactNode;
  placeholder?: string;
}) {
  const navigate = useNavigate();

  const handleSearch = (q: string) => {
    if (q) {
      navigate({ to: "/browse", search: { q } });
    } else {
      navigate({ to: "/browse" });
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => e.preventDefault()}
        className={cn(
          "flex w-full items-center gap-2 border border-border bg-background",
          size === "lg" ? "p-2" : "p-1.5",
        )}
      >
        <Search
          className={cn("ml-2 text-muted-foreground", size === "lg" ? "h-5 w-5" : "h-4 w-4")}
        />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={(e) => handleSearch(e.target.value)}
          className={cn(
            "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
            size === "lg" ? "h-12 text-base" : "h-9 text-sm",
          )}
        />
        {action}
      </form>
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground hover:border-foreground/60"
            >
              {c}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- EmptyState ---------- */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center border border-dashed border-border p-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Search className="h-5 w-5" />}
      </div>
      <h3 className="mt-4 font-display text-xl">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------- OrderStatusBadge ---------- */
const orderStyles: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-900 border-amber-200",
  Paid: "bg-primary/10 text-primary border-primary/20",
  Cancelled: "bg-muted text-muted-foreground border-border",
  Refunded: "bg-flag-red/10 text-flag-red border-flag-red/30",
  Completed:
    "bg-[oklch(0.55_0.14_150)]/10 text-[oklch(0.35_0.14_150)] border-[oklch(0.55_0.14_150)]/30",
};
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-medium uppercase tracking-wider text-[0.65rem]",
        orderStyles[status],
      )}
    >
      {status}
    </Badge>
  );
}

/* ---------- Section header ---------- */
export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 border-b border-border pb-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 font-display text-3xl md:text-4xl leading-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}
