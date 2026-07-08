import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import {
  AssetCard,
  CategoryPill,
  CollectionCard,
  SearchBar,
  SectionHeader,
} from "@/components/kna/components";
import { assets, categories, collections } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, Search, ShoppingBag, Download } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kenya News Agency Digital Archive — Kenya's history, preserved and licensed" },
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
  const hero = assets[0];
  const featured = assets.slice(0, 8);
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-ink text-paper">
        <img
          src={hero.image}
          alt=""
          aria-hidden
          className="bw absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/60 to-ink/85" />
        <div className="watermark relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 md:py-32 lg:grid-cols-12">
          <div className="relative z-10 lg:col-span-8">
            <p className="eyebrow !text-paper/70">Established 1963 · National archive</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl lg:text-7xl">
              Kenya's history,{" "}
              <span className="italic text-paper/85">preserved</span> and
              licensed.
            </h1>
            <p className="mt-6 max-w-2xl text-base text-paper/80 md:text-lg">
              Six decades of state photography, wire copy and audiovisual
              records — indexed, catalogued and available for editorial,
              commercial, educational and government use.
            </p>
            <div className="mt-8 max-w-2xl bg-paper text-foreground shadow-2xl">
              <SearchBar size="lg" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Independence", "Kenyatta", "Wildlife", "Nairobi 1970s", "Kip Keino"].map((t) => (
                <button
                  key={t}
                  className="rounded-full border border-paper/25 px-3 py-1 text-xs text-paper/80 backdrop-blur hover:border-paper/60 hover:text-paper"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="relative z-10 hidden self-end border-l border-paper/20 pl-8 lg:col-span-4 lg:block">
            <p className="eyebrow !text-paper/70">Current record</p>
            <p className="mt-3 font-display text-lg leading-snug text-paper">
              {hero.title}
            </p>
            <dl className="mt-5 space-y-2 text-xs text-paper/70">
              <Row k="Photographer" v={hero.photographer} />
              <Row k="Date" v={hero.date} />
              <Row k="Location" v={hero.location} />
              <Row k="Collection" v={hero.collection} />
            </dl>
          </div>
        </div>
      </section>

      {/* Featured collections */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeader
          eyebrow="Featured collections"
          title="Curated by KNA archivists"
          action={
            <Link
              to="/browse"
              className="hidden items-center gap-1 text-sm text-foreground hover:underline md:inline-flex"
            >
              All collections <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeader eyebrow="Browse by subject" title="Categories" />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <CategoryPill key={c.id} name={c.name} count={c.count} />
          ))}
        </div>
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
                body: "Choose the resolution and license that fits your use. Pay in KES via M-Pesa, eCitizen, Visa or Mastercard.",
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-paper/50">{k}</dt>
      <dd className="text-right text-paper/90">{v}</dd>
    </div>
  );
}
