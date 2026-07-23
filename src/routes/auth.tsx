import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { UrithiLogo } from "@/components/kna/logo";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      {/* Form side */}
      <div className="flex min-h-dvh flex-col p-6 md:p-12">
        <Link to="/" className="flex items-center gap-3" aria-label="Urithi home">
          <UrithiLogo className="h-12 w-auto sm:h-14 md:h-16" />
        </Link>
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Urithi · Kenya News Agency
        </p>
      </div>

      {/* Photo side */}
      <div className="relative hidden lg:block">
        <img
          src={heroImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-paper">
          <p className="eyebrow !text-paper/70">Established 1963 · National archive</p>
          <p className="mt-3 font-display text-2xl leading-snug max-w-md">
            Kenya's history, preserved and licensed.
          </p>
        </div>
      </div>
    </div>
  );
}
