import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteShell } from "@/components/kna/site-shell";
import {
  AssetCard,
  EmptyState,
  LicenseBadge,
  PreviewImage,
  SectionHeader,
  type AssetCardData,
} from "@/components/kna/components";
import { assets, findAsset, formatKES, licenseInfo } from "@/lib/mock-data";
import type { Asset, LicenseType } from "@/lib/mock-data";
import { useAsset, useAssets, useLicenses } from "@/hooks/use-assets";
import { useAddToCart } from "@/hooks/use-cart";
import { ApiError } from "@/lib/api/client";
import type { AssetListItem } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Camera, MapPin, Calendar, Tag } from "lucide-react";

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

export const Route = createFileRoute("/asset/$slug")({
  // Mock demo assets (still linked from admin/account pages) are looked up
  // by slug here; real assets have no slug and are fetched client-side by
  // id in RealAssetDetail below (see src/lib/api/assets.ts).
  loader: ({ params }) => ({ mockAsset: findAsset(params.slug) ?? null }),
  head: ({ loaderData }) =>
    loaderData?.mockAsset
      ? {
          meta: [
            { title: `${loaderData.mockAsset.title} — Urithi Digital Archive` },
            { name: "description", content: loaderData.mockAsset.caption },
            { property: "og:title", content: loaderData.mockAsset.title },
            { property: "og:description", content: loaderData.mockAsset.caption },
            { property: "og:image", content: loaderData.mockAsset.image },
          ],
        }
      : { meta: [{ title: "Asset — Urithi Digital Archive" }] },
  component: AssetPage,
});

function AssetPage() {
  const { mockAsset } = Route.useLoaderData();
  const { slug } = Route.useParams();
  return mockAsset ? <MockAssetDetail asset={mockAsset} /> : <RealAssetDetail id={slug} />;
}

function MockAssetDetail({ asset }: { asset: Asset }) {
  const [license, setLicense] = useState<LicenseType>(asset.licenses[0]);
  const [tier, setTier] = useState(asset.tiers[0].label);

  const related = assets.filter((a) => a.id !== asset.id).slice(0, 4);

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/browse">{asset.category}</Link>
              </BreadcrumbLink>
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
            <PreviewImage src={asset.image} alt={asset.title} aspect="aspect-[4/3]" zoomable />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            All previews are watermarked. Purchased files are delivered without the Urithi
            watermark.
          </p>

          {/* Metadata */}
          <div className="mt-10 border-t border-border pt-8">
            <p className="eyebrow">Record metadata</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl leading-tight">{asset.title}</h1>
            <p className="mt-4 text-base text-muted-foreground max-w-prose leading-relaxed">
              {asset.description}
            </p>

            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <Meta
                icon={Camera}
                label="Photographer"
                value={`${asset.photographer} — ${asset.credit}`}
              />
              <Meta icon={Calendar} label="Publication date" value={asset.date} />
              <Meta icon={MapPin} label="Location" value={`${asset.location} · ${asset.county}`} />
              <Meta icon={Tag} label="Historical period" value={asset.period} />
            </dl>

            <div className="mt-8">
              <p className="eyebrow mb-3">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-paper-warm px-3 py-1 text-xs"
                  >
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
            <p className="mt-1 text-xs text-muted-foreground">
              Prices in Kenya Shillings, inclusive of VAT.
            </p>

            <div className="mt-6">
              <p className="eyebrow mb-3">Choose license</p>
              <RadioGroup
                value={license}
                onValueChange={(v) => setLicense(v as LicenseType)}
                className="space-y-2"
              >
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
                      <TableCell className="py-2 text-right text-sm tabular-nums">
                        {formatKES(t.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button
              className="mt-6 w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
              size="lg"
              asChild
            >
              <Link to="/cart">
                Add to cart ·{" "}
                {formatKES(asset.tiers.find((t) => t.label === tier)?.price ?? asset.priceFrom)}
              </Link>
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
          {related.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

function RealAssetDetail({ id }: { id: string }) {
  const { data: asset, isPending, isError } = useAsset(id);
  const { data: assetsPage } = useAssets({ page: 1 });
  const { data: licenses } = useLicenses();
  const [licenseId, setLicenseId] = useState<string>();
  const [side, setSide] = useState<"front" | "back">("front");
  const addToCart = useAddToCart();
  const navigate = useNavigate();

  const selectedLicenseId = licenseId ?? licenses?.[0]?.id;

  if (isPending) {
    return (
      <SiteShell>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 md:px-8 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </SiteShell>
    );
  }

  if (isError || !asset) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <EmptyState
            title="Record not found"
            description="This record isn't in the archive — it may have been moved or reclassified."
            action={
              <Button asChild variant="outline">
                <Link to="/">Return to archive</Link>
              </Button>
            }
          />
        </div>
      </SiteShell>
    );
  }

  const related = (assetsPage?.results ?? []).filter((a) => a.id !== asset.id).slice(0, 4);
  const categoryName = asset.category?.name ?? "Uncategorised";
  const dateLabel =
    asset.capture_date?.slice(0, 10) ?? asset.publication_date?.slice(0, 10) ?? "Undated";
  const locationLabel =
    [asset.metadata?.location, asset.metadata?.county].filter(Boolean).join(" · ") || "—";
  const periodLabel = asset.metadata?.historical_period || "—";
  const isTwoSided = asset.has_back && Boolean(asset.image_back);
  const mainImage = side === "back" && asset.image_back ? asset.image_back : asset.image;

  const handleAddToCart = () => {
    const selectedLicense = licenses?.find((l) => l.id === selectedLicenseId);
    if (!selectedLicenseId || !selectedLicense) {
      toast.error("Choose a license first.");
      return;
    }
    addToCart.mutate(
      {
        asset_id: asset.id,
        license_id: selectedLicenseId,
        title: asset.title,
        thumbnail: asset.thumbnail,
        price: asset.price,
        license_name: selectedLicense.name,
      },
      {
        onSuccess: () => {
          toast.success("Added to cart.");
          navigate({ to: "/cart" });
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            toast.error("This record is already in your cart.");
            return;
          }
          toast.error("Couldn't add this record to your cart. Try again.");
        },
      },
    );
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/browse">{categoryName}</Link>
              </BreadcrumbLink>
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
            <PreviewImage
              key={mainImage}
              src={mainImage}
              alt={`${asset.title}${side === "back" ? " — back" : ""}`}
              aspect="aspect-[4/3]"
              zoomable
            />
          </div>

          {isTwoSided && (
            <div className="mt-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSide("front")}
                  className={`aspect-[4/3] w-24 overflow-hidden bg-ink ring-offset-2 transition ${
                    side === "front" ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={asset.image}
                    alt={`${asset.title} — front`}
                    className="bw h-full w-full object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setSide("back")}
                  className={`aspect-[4/3] w-24 overflow-hidden bg-ink ring-offset-2 transition ${
                    side === "back" ? "ring-2 ring-ink" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={asset.image_back!}
                    alt={`${asset.title} — back`}
                    className="bw h-full w-full object-cover"
                  />
                </button>
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            All previews are watermarked. Purchased files are delivered without the Urithi
            watermark.
          </p>

          {/* Metadata */}
          <div className="mt-10 border-t border-border pt-8">
            <p className="eyebrow">Record metadata</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl leading-tight">{asset.title}</h1>
            <p className="mt-4 text-base text-muted-foreground max-w-prose leading-relaxed">
              {asset.description}
            </p>

            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <Meta
                icon={Camera}
                label="Photographer"
                value={`${asset.photographer} — ${asset.photographer_credit}`}
              />
              <Meta icon={Calendar} label="Publication date" value={dateLabel} />
              <Meta icon={MapPin} label="Location" value={locationLabel} />
              <Meta icon={Tag} label="Historical period" value={periodLabel} />
            </dl>

            <div className="mt-8">
              <p className="eyebrow mb-3">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {asset.tags.map((t) => (
                  <span
                    key={t.id}
                    className="rounded-full border border-border bg-paper-warm px-3 py-1 text-xs"
                  >
                    #{t.name}
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
              <span className="tabular-nums">{formatKES(asset.price)}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Prices in Kenya Shillings, inclusive of VAT.
            </p>

            <div className="mt-6">
              <p className="eyebrow mb-3">Choose license</p>
              <RadioGroup
                value={selectedLicenseId}
                onValueChange={setLicenseId}
                className="space-y-2"
              >
                {(licenses ?? []).map((l) => (
                  <label
                    key={l.id}
                    htmlFor={`lic-${l.id}`}
                    className="flex cursor-pointer items-start gap-3 border border-border bg-background p-3 has-[[data-state=checked]]:border-ink has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-ink"
                  >
                    <RadioGroupItem id={`lic-${l.id}`} value={l.id} className="mt-1" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline">{l.name}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{l.description}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <Button
              className="mt-6 w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
              size="lg"
              onClick={handleAddToCart}
              disabled={addToCart.isPending || !selectedLicenseId}
            >
              {addToCart.isPending ? "Adding…" : `Add to cart · ${formatKES(asset.price)}`}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Instant download · Invoice + license certificate included
            </p>
          </div>
        </aside>
      </div>

      {/* Related */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <SectionHeader eyebrow="Related records" title="From the archive" />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((a) => (
            <AssetCard key={a.id} asset={toCard(a)} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center gap-2 eyebrow">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}
