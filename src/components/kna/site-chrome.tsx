import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 md:px-8 md:py-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center bg-ink text-paper font-display text-lg leading-none"
          >
            K
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-base font-semibold tracking-tight">
              Kenya News Agency
            </span>
            <span className="eyebrow !text-[0.6rem]">Digital Archive</span>
          </span>
        </Link>

        <nav className="ml-4 hidden md:flex items-center gap-6 text-sm">
          <Link to="/browse" className="text-foreground/80 hover:text-foreground">
            Browse
          </Link>
          <Link
            to="/browse"
            search={{ view: "collections" } as never}
            className="text-foreground/80 hover:text-foreground"
          >
            Collections
          </Link>
          <a href="#" className="text-foreground/80 hover:text-foreground">
            Licensing
          </a>
          <a href="#" className="text-foreground/80 hover:text-foreground">
            About
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="Search">
            <Link to="/browse">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Cart">
            <Link to="/cart">
              <ShoppingCart className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Account" className="hidden sm:inline-flex">
            <Link to="/account">
              <User className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
            <Link to="/auth/login">Sign in</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-paper-warm">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden className="grid h-8 w-8 place-items-center bg-ink text-paper font-display text-base">
                K
              </span>
              <span className="font-display text-lg">Kenya News Agency</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              A national photographic and press archive maintained by the
              Ministry of Information, Communications and the Digital Economy.
            </p>
            <div className="mt-4 flex items-center gap-2" aria-hidden>
              <span className="h-1.5 w-6 bg-ink" />
              <span className="h-1.5 w-6 bg-flag-red" />
              <span className="h-1.5 w-6 bg-[oklch(0.55_0.14_150)]" />
              <span className="h-1.5 w-6 bg-paper border border-border" />
            </div>
          </div>
          <FooterCol
            title="Archive"
            links={["Collections", "Categories", "Latest additions", "Photographers"]}
          />
          <FooterCol
            title="Licensing"
            links={["How it works", "License types", "Pricing", "Terms of use"]}
          />
          <FooterCol
            title="Institution"
            links={["About KNA", "Contact", "Press office", "Accessibility"]}
          />
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Kenya News Agency. All rights reserved.</p>
          <p>Nairobi · Kenya · ISO 27001 archival standards</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-foreground/80 hover:text-foreground">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
