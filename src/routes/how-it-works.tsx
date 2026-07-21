import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import { SectionHeader } from "@/components/kna/components";
import { Button } from "@/components/ui/button";
import { Search, LogIn, ShoppingBag, Download, ArrowRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — Urithi Digital Archive" },
      {
        name: "description",
        content:
          "How to search, license and download watermark-free records from the Urithi digital archive.",
      },
    ],
  }),
  component: HowItWorksPage,
});

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Search the archive",
    body: "Browse and search freely, no account needed. Filter by keyword, category, collection or photographer, and add anything you like to your cart.",
  },
  {
    n: "02",
    icon: LogIn,
    title: "Sign in at checkout",
    body: "An account is only required when you're ready to pay. Whatever's already in your cart carries over automatically once you sign in or register.",
  },
  {
    n: "03",
    icon: ShoppingBag,
    title: "Choose a license & pay",
    body: "Pick the license that matches your use — Editorial, Commercial, Educational or Government — and complete payment securely.",
  },
  {
    n: "04",
    icon: Download,
    title: "Download, watermark-free",
    body: "Once payment is confirmed, the watermark-free file is granted to your account immediately under My Downloads.",
  },
];

function HowItWorksPage() {
  return (
    <SiteShell>
      {/* Intro banner */}
      <section className="border-b border-border bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <p className="eyebrow !text-paper/70">Licensing, explained</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] md:text-6xl">How it works</h1>
          <p className="mt-6 max-w-2xl text-base text-paper/80 md:text-lg">
            From search to a watermark-free download, licensing a record from the Urithi archive
            takes four simple steps.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHeader eyebrow="Licensing in four steps" title="Search, sign in, pay, download" />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
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
      </section>

      {/* Downloads & receipts detail */}
      <section className="border-t border-border bg-paper-warm">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <SectionHeader eyebrow="After you pay" title="Your downloads" />
          <div className="grid gap-10 md:grid-cols-3">
            <div className="border border-border bg-background p-6">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <h3 className="mt-4 font-display text-xl">Watermark-free, immediately</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Every preview on the site carries the Urithi watermark. The moment your payment is
                confirmed, that restriction lifts — your copy is licensed and clean.
              </p>
            </div>
            <div className="border border-border bg-background p-6">
              <Download className="h-5 w-5 text-muted-foreground" />
              <h3 className="mt-4 font-display text-xl">Fresh links, every time</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Download links are generated on demand and expire shortly after for security. Visit{" "}
                <Link to="/account/downloads" className="underline underline-offset-4">
                  My Downloads
                </Link>{" "}
                any time to get a fresh one — there's no need to save the link itself.
              </p>
            </div>
            <div className="border border-border bg-background p-6">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              <h3 className="mt-4 font-display text-xl">A receipt, by email</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                A confirmation email summarises what you bought, the license and price for each
                item, and links back to your account to download.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center md:px-8">
        <h2 className="font-display text-3xl md:text-4xl">Ready to find something?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Search the archive now — an account is only needed when you're ready to check out.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-none bg-ink text-paper hover:bg-ink/90">
            <Link to="/browse">
              Browse the archive <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/licensing">See license types</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
