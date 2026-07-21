import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import { SectionHeader, EmptyState } from "@/components/kna/components";
import { useLicenses } from "@/hooks/use-assets";
import { licenseInfo, type LicenseType } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { LicenseOut } from "@/lib/api/types";
import {
  Newspaper,
  Building2,
  GraduationCap,
  Landmark,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/licensing")({
  head: () => ({
    meta: [
      { title: "Licensing — Urithi Digital Archive" },
      {
        name: "description",
        content:
          "The license types available on the Urithi archive — Editorial, Commercial, Educational and Government — and what each one permits.",
      },
    ],
  }),
  component: LicensingPage,
});

// Presentation-only mapping — falls back to a generic icon for any license
// name the backend adds that we don't specifically recognise.
function iconFor(name: string) {
  const n = name.toLowerCase();
  if (n.includes("editorial")) return Newspaper;
  if (n.includes("commercial")) return Building2;
  if (n.includes("educational")) return GraduationCap;
  if (n.includes("government")) return Landmark;
  return FileCheck2;
}

// Curated usage examples keyed by the same names as the backend's fixed
// license types — supplements the API's own `description` field.
function usageExamples(name: string): string[] | undefined {
  const key = (Object.keys(licenseInfo) as LicenseType[]).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  return key ? licenseInfo[key].usage : undefined;
}

function LicensingPage() {
  const { data: licenses, isPending, isError } = useLicenses();

  return (
    <SiteShell>
      {/* Intro banner */}
      <section className="border-b border-border bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <p className="eyebrow !text-paper/70">Usage rights</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">Licensing</h1>
          <p className="mt-6 max-w-2xl text-base text-paper/80 md:text-lg">
            Every record is licensed, not sold outright. Choose the license that matches how you'll
            actually use it — the price covers that use, not the image itself.
          </p>
        </div>
      </section>

      {/* License types */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeader eyebrow="Available on every record" title="License types" />

        {isError ? (
          <EmptyState
            title="Couldn't load license types"
            description="Something went wrong reaching the server. Try refreshing the page."
          />
        ) : isPending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(licenses ?? []).map((l: LicenseOut) => {
              const Icon = iconFor(l.name);
              const usage = usageExamples(l.name);
              return (
                <div key={l.id} className="border border-border bg-paper-warm p-6">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="mt-4 font-display text-xl">{l.name}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {l.description}
                  </p>
                  {usage && (
                    <ul className="mt-4 space-y-1 border-t border-border pt-4">
                      {usage.map((u) => (
                        <li key={u} className="text-xs text-muted-foreground">
                          · {u}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Usage principles */}
      <section className="border-t border-border bg-paper-warm">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <SectionHeader eyebrow="Good to know" title="How usage rights work" />
          <div className="grid gap-10 md:grid-cols-3">
            <div className="border-t border-ink pt-6">
              <ShieldAlert className="h-5 w-5 text-muted-foreground" />
              <h3 className="mt-6 font-display text-2xl">Per-record, per-license</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                A license covers one record for one declared use. Licensing a photograph for
                editorial use doesn't clear it for commercial or government use — pick the license
                that matches what you're actually doing with it.
              </p>
            </div>
            <div className="border-t border-ink pt-6">
              <FileCheck2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="mt-6 font-display text-2xl">Not transferable</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Licenses belong to the account that purchased them. Downloads are tied to your
                account and order history, and can be reissued from{" "}
                <Link to="/account/downloads" className="underline underline-offset-4">
                  My Downloads
                </Link>{" "}
                at any time.
              </p>
            </div>
            <div className="border-t border-ink pt-6">
              <Newspaper className="h-5 w-5 text-muted-foreground" />
              <h3 className="mt-6 font-display text-2xl">Not sure which one?</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                When in doubt, license for the broadest use you expect — it's easier to license
                correctly up front than to re-license later. Reach out to the archive team if your
                use case doesn't fit any of the types above.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center md:px-8">
        <h2 className="font-display text-3xl md:text-4xl">Ready to license a record?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Search the archive, pick a license on the record's page, and check out when you're ready.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-none bg-ink text-paper hover:bg-ink/90">
            <Link to="/browse">
              Browse the archive <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/how-it-works">How it works</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
