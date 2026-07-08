import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import {
  AssetCard,
  LicenseBadge,
  SectionHeader,
  WatermarkImage,
} from "@/components/kna/components";
import { assets, findAsset, formatKES, licenseInfo } from "@/lib/mock-data";
import type { LicenseType } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Camera, MapPin, Calendar, Tag, ZoomIn } from "lucide-react";

export const Route = createFileRoute("/asset/$slug")({
  loader: ({ params }) => {
    const asset = findAsset(params.slug);
    if (!asset) throw notFound();
    return { asset };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.asset.title} — KNA Digital Archive` },
            { name: "description", content: loaderData.asset.caption },
            { property: "og:title", content: loaderData.asset.title },
            { property: "og:description", content: loaderData.asset.caption },
            { property: "og:image", content: loaderData.asset.image },
          ],
        }
      : { meta: [{ title: "Asset — KNA Digital Archive" }, { name: "robots", content: "noindex" }] },
  component: AssetPage,
});

function AssetPage() {
  const { asset } = Route.useLoaderData() as { asset: import("@/lib/mock-data").Asset };
  const [license, setLicense] = useState<LicenseType>(asset.licenses[0]);
  const [tier, setTier] = useState(asset.tiers[0].label);

  const related = assets.filter((a) => a.id !== asset.id).slice(0, 4);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/browse">{asset.category}</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 max-w-[40ch]">{asset.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 md:px-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Preview */}
        <div>
          <div className="relative">
            <WatermarkImage src={asset.image} alt={asset.title} aspect="aspect-[4/3]" />
            <button
              aria-label="Zoom preview"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center bg-ink/80 text-paper hover:bg-ink"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            All previews are watermarked. Purchased files are delivered without the KNA watermark.
          </p>

          {/* Metadata */}
          <div className="mt-10 border-t border-border pt-8">
            <p className="eyebrow">Record metadata</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl leading-tight">{asset.title}</h1>
            <p className="mt-4 text-base text-muted-foreground max-w-prose leading-relaxed">
              {asset.description}
            </p>

            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <Meta icon={Camera} label="Photographer" value={`${asset.photographer} — ${asset.credit}`} />
              <Meta icon={Calendar} label="Publication date" value={asset.date} />
              <Meta icon={MapPin} label="Location" value={`${asset.location} · ${asset.county}`} />
              <Meta icon={Tag} label="Historical period" value={asset.period} />
            </dl>

            <div className="mt-8">
              <p className="eyebrow mb-3">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border bg-paper-warm px-3 py-1 text-xs">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Purchase panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-border bg-paper-warm p-6">
            <p className="eyebrow">License this record</p>
            <p className="mt-2 text-3xl font-display">
              From <span className="tabular-nums">{formatKES(asset.priceFrom)}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Prices in Kenya Shillings, inclusive of VAT.</p>

            <div className="mt-6">
              <p className="eyebrow mb-3">Choose license</p>
              <RadioGroup value={license} onValueChange={(v) => setLicense(v as LicenseType)} className="space-y-2">
                {asset.licenses.map((l) => (
                  <label
                    key={l}
                    htmlFor={`lic-${l}`}
                    className="flex cursor-pointer items-start gap-3 border border-border bg-background p-3 has-[[data-state=checked]]:border-ink has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-ink"
                  >
                    <RadioGroupItem id={`lic-${l}`} value={l} className="mt-1" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <LicenseBadge type={l} />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{licenseInfo[l].blurb}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="mt-6">
              <p className="eyebrow mb-3">Resolution & price</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8 text-[0.7rem]">Tier</TableHead>
                    <TableHead className="h-8 text-[0.7rem]">Resolution</TableHead>
                    <TableHead className="h-8 text-right text-[0.7rem]">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asset.tiers.map((t) => (
                    <TableRow
                      key={t.label}
                      onClick={() => setTier(t.label)}
                      data-active={tier === t.label}
                      className="cursor-pointer data-[active=true]:bg-ink data-[active=true]:text-paper"
                    >
                      <TableCell className="py-2 text-sm font-medium">{t.label}</TableCell>
                      <TableCell className="py-2 text-sm">{t.resolution}</TableCell>
                      <TableCell className="py-2 text-right text-sm tabular-nums">{formatKES(t.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button className="mt-6 w-full rounded-none bg-ink text-paper hover:bg-ink/90" size="lg" asChild>
              <Link to="/cart">Add to cart · {formatKES(asset.tiers.find(t => t.label === tier)?.price ?? asset.priceFrom)}</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Instant download · Invoice + license certificate included
            </p>
          </div>
        </aside>
      </div>

      {/* Related */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <SectionHeader eyebrow="Related records" title="From the same collection" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((a) => <AssetCard key={a.id} asset={a} />)}
        </div>
      </section>
    </SiteShell>
  );
}

function Meta({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center gap-2 eyebrow">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}
