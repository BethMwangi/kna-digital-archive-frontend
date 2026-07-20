import { Link } from "@tanstack/react-router";
import { Search, User, ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UrithiLogo } from "@/components/kna/logo";
import { useAuth } from "@/lib/auth/use-auth";
import { useCartStore } from "@/hooks/use-cart";
import { formatKES } from "@/lib/mock-data";

export function SiteHeader() {
  const { isAuthenticated, user } = useAuth();
  const cartItems = useCartStore(s => s.items);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div aria-hidden className="flex h-1 w-full">
        <span className="flex-1 bg-ink" />
        <span className="flex-1 bg-flag-red" />
        <span className="flex-1 bg-flag-green" />
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 md:px-8 md:py-4">
        <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="Urithi home">
          <UrithiLogo className="h-72 w-auto sm:h-28" />
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
          {/* Cart Dropdown */}
          <div className="relative group flex items-center h-full">
            <Button variant="ghost" size="icon" asChild aria-label="Cart" className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4" />
                {cartItems.length > 0 && (
                  <span className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full bg-flag-red text-[8px] font-bold text-white flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </Button>
            
            {/* Hover Modal */}
            <div className="absolute right-0 top-full mt-1 hidden w-72 flex-col rounded-sm border border-border bg-background p-4 shadow-xl group-hover:flex">
              <p className="font-display text-lg">Your Cart</p>
              {cartItems.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Your cart is empty.</p>
              ) : (
                <>
                  <div className="mt-3 max-h-60 overflow-y-auto pr-1 space-y-3">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="h-10 w-12 shrink-0 bg-ink overflow-hidden">
                          <img src={item.asset.thumbnail} alt="" className="h-full w-full object-cover bw" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium line-clamp-1">{item.asset.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.license.name}</p>
                        </div>
                        <p className="text-xs font-bold tabular-nums">{formatKES(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-border pt-3">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-display text-xl tabular-nums">{formatKES(cartTotal)}</span>
                    </div>
                    <Button asChild className="w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90">
                      <Link to="/checkout">Checkout</Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {isAuthenticated ? (
            <Link to="/account/profile" className="hidden sm:block ml-2">
              <div className="h-8 w-8 overflow-hidden rounded-full border border-border bg-ink">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.first_name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-full w-full p-1.5 text-paper" />
                )}
              </div>
            </Link>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                asChild
                aria-label="Account"
                className="hidden sm:inline-flex"
              >
                <Link to="/account">
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hidden md:inline-flex ml-1">
                <Link to="/auth/login">Sign in</Link>
              </Button>
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
    <footer className="mt-24 border-t border-border bg-paper-warm">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <UrithiLogo className="h-50 w-auto" />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Urithi is the national photographic and press archive of the Kenya News Agency,
              maintained by the Ministry of Information, Communications and the Digital Economy.
            </p>
            <div className="mt-4 flex items-center gap-2" aria-hidden>
              <span className="h-1.5 w-6 bg-ink" />
              <span className="h-1.5 w-6 bg-flag-red" />
              <span className="h-1.5 w-6 bg-flag-green" />
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
            links={[
              "About Urithi",
              "Kenya News Agency",
              "Contact",
              "Press office",
              "Accessibility",
            ]}
          />
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Urithi · Kenya News Agency. All rights reserved.</p>
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
