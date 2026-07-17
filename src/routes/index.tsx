import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import {
  AssetCard,
  CategoryPill,
  CollectionCard,
  SearchBar,
  SectionHeader,
  type AssetCardData,
  type CollectionCardData,
} from "@/components/kna/components";
import { useAssets, useCategories, useCollections, useFeaturedAssets } from "@/hooks/use-assets";
import type { AssetListItem, CollectionOut } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowUpRight, Search, ShoppingBag, Download } from "lucide-react";
import heroImage from "@/assets/hero.jpg";

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

// Collections have no cover image of their own yet — use a real asset from
// that collection as the cover (see src/lib/api/assets.ts).
function toCollectionCard(c: CollectionOut, assets: AssetListItem[]): CollectionCardData {
  const cover = assets.find((a) => a.collection?.id === c.id)?.thumbnail ?? assets[0]?.thumbnail;
  return { id: c.id, title: c.name, cover: cover ?? heroImage };
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Urithi — Kenya's history, preserved and licensed" },
      {
        name: "description",
        content:
          "Search 20,000+ historical photographs, newspapers and audiovisual records from Kenya's national press archive. License editorial, commercial, educational and government use.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: featuredAssets, isPending, isError } = useFeaturedAssets();
  const { data: realCategories, isPending: categoriesPending } = useCategories();
  const {
    data: realCollections,
    isPending: collectionsPending,
    isError: collectionsError,
  } = useCollections();
  const { data: assetsPage } = useAssets({ page: 1 });
  const assetsForCover = assetsPage?.results ?? [];
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-ink text-paper">
        <img
          src={heroImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/20 to-ink/60" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 md:py-32 lg:grid-cols-12">
          <div className="relative z-10 lg:col-span-8">
            <div className="inline-block max-w-2xl rounded-2xl bg-ink/55 p-6 backdrop-blur-sm md:p-8">
              <p className="eyebrow !text-paper/70">Established 1963 · National archive</p>
              <h1 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl lg:text-7xl">
                Kenya's history, <span className="italic text-paper/85">preserved</span> and
                licensed.
              </h1>
              <p className="mt-6 text-base text-paper/80 md:text-lg">
                Six decades of state photography, wire copy and audiovisual records — indexed,
                catalogued and available for editorial, commercial, educational and government use.
              </p>
            </div>
            <div className="mt-8 max-w-2xl bg-paper text-foreground shadow-2xl">
              <SearchBar size="lg" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Independence", "Kenyatta", "Wildlife", "Nairobi 1970s", "Kip Keino"].map((t) => (
                <button
                  key={t}
                  className="rounded-full border border-paper/25 bg-ink/40 px-3 py-1 text-xs text-paper/80 backdrop-blur hover:border-paper/60 hover:text-paper"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured collections */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeader
          eyebrow="Featured collections"
          title="Curated by Urithi archivists"
          action={
            <Link
              to="/browse"
              className="hidden items-center gap-1 text-sm text-foreground hover:underline md:inline-flex"
            >
              All collections <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        {collectionsError ? (
          <p className="text-sm text-muted-foreground">Couldn't load collections.</p>
        ) : collectionsPending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {(realCollections ?? []).map((c) => (
              <CollectionCard key={c.id} collection={toCollectionCard(c, assetsForCover)} />
            ))}
          </div>
        )}
      </section>

      {/* Latest additions */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <SectionHeader
          eyebrow="Latest additions"
          title="This week in the archive"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/browse">
                Browse all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          }
        />
        {isError ? (
          <p className="text-sm text-muted-foreground">Couldn't load the latest records.</p>
        ) : isPending ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="mt-3 h-4 w-2/3" />
                <Skeleton className="mt-2 h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {(featuredAssets ?? []).map((a) => (
              <AssetCard key={a.id} asset={toCard(a)} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeader eyebrow="Browse by subject" title="Categories" />
        {categoriesPending ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(realCategories ?? []).map((c) => (
              <CategoryPill key={c.id} name={c.name} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-paper-warm">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <SectionHeader eyebrow="Licensing in three steps" title="How it works" />
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                n: "01",
                icon: Search,
                title: "Search",
                body: "Find records by keyword, era, county, photographer or collection. Every asset is indexed with full provenance.",
              },
              {
                n: "02",
                icon: ShoppingBag,
                title: "License & buy",
                body: "Choose the resolution and license that fits your use. Pay in KES via M-Pesa, eCitizen.",
              },
              {
                n: "03",
                icon: Download,
                title: "Download",
                body: "Watermark-free files are available immediately in your account. Invoices and license certificates included.",
              },
            ].map((s) => (
              <div key={s.n} className="border-t border-ink pt-6">
                <div className="flex items-center justify-between">
                  <p className="font-display text-4xl">{s.n}</p>
                  <s.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-6 font-display text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
