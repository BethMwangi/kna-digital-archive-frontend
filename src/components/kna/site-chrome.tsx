import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UrithiLogo } from "@/components/kna/logo";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth/use-auth";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  const { data: cart } = useCart();
  const itemCount = cart?.item_count ?? 0;
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div aria-hidden className="flex h-1 w-full">
        <span className="flex-1 bg-ink" />
        <span className="flex-1 bg-flag-red" />
        <span className="flex-1 bg-flag-green" />
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 md:px-8 md:py-4">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Urithi home">
          <UrithiLogo className="h-9 w-auto sm:h-11 md:h-14" />
          <span className="sr-only">Urithi — by Kenya News Agency · Digital Archive</span>
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
          <Link to="/about" className="text-foreground/80 hover:text-foreground">
            About KNA
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/browse"
            aria-label="Search"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className={buttonVariants({ variant: "ghost", size: "icon" }) + " relative"}
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-flag-red px-1 text-[0.6rem] font-semibold leading-none text-paper">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
          {!isLoading && (
            <>
              <Link
                to="/account/profile"
                aria-label="Account"
                className={
                  buttonVariants({ variant: "ghost", size: "icon" }) + " hidden sm:inline-flex"
                }
              >
                <User className="h-4 w-4" />
              </Link>
              {!isAuthenticated && (
                <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
                  <Link to="/auth/login">Sign in</Link>
                </Button>
              )}
            </>
          )}
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
    <footer className="relative mt-16 overflow-hidden bg-ink text-paper">
      {/* Flag rule — black, red, green separated by white, as on the Kenyan flag */}
      <div aria-hidden className="flex h-1.5 w-full">
        <span className="flex-1 bg-ink" />
        <span className="w-1 bg-paper" />
        <span className="flex-1 bg-flag-red" />
        <span className="w-1 bg-paper" />
        <span className="flex-1 bg-flag-green" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-flag-green/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-flag-red/25 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            {/* The logo artwork is drawn for a light background — sit it on a paper chip */}
            <div className="inline-block rounded-xl bg-paper px-4 py-3 shadow-lg">
              <UrithiLogo className="h-10 w-auto sm:h-12" />
            </div>
            <p className="mt-5 text-sm leading-relaxed text-paper/70">
              Urithi is the national photographic and press archive of the Kenya News Agency,
              maintained by the Ministry of Information, Communications and the Digital Economy.
            </p>
          </div>
          <FooterCol
            title="Archive"
            accent="bg-flag-red"
            links={["Collections", "Categories", "Latest additions", "Photographers"]}
          />
          <FooterCol
            title="Institution"
            accent="bg-flag-green"
            links={[
              { label: "About KNA", to: "/about" },
              { label: "Kenya News Agency", href: "https://www.kenyanews.go.ke/" },
              "Contact",
              "Press office",
              "Accessibility",
            ]}
          />
        </div>
      </div>
      <div className="relative bg-flag-green-deep">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-paper/75 md:flex-row md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} Urithi · Kenya News Agency. All rights reserved.</p>
          <p>Nairobi · Kenya · ISO 27001 archival standards</p>
        </div>
      </div>
    </footer>
  );
}

type FooterLink = string | { label: string; to: string } | { label: string; href: string };

function FooterCol({
  title,
  accent,
  links,
}: {
  title: string;
  /** Tailwind bg class for the flag-colour underline beneath the heading. */
  accent: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <p className="eyebrow !text-paper">{title}</p>
      <span aria-hidden className={`mt-2 block h-0.5 w-8 rounded-full ${accent}`} />
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => {
          const label = typeof l === "string" ? l : l.label;
          return (
            <li key={label}>
              {typeof l === "string" ? (
                <a href="#" className="text-paper/70 transition-colors hover:text-paper">
                  {label}
                </a>
              ) : "to" in l ? (
                <Link
                  to={l.to as never}
                  className="text-paper/70 transition-colors hover:text-paper"
                >
                  {label}
                </Link>
              ) : (
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-paper/70 transition-colors hover:text-paper"
                >
                  {label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
