import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { assets } from "@/lib/mock-data";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const photo = assets[3];
  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col p-6 md:p-12">
        <Link to="/" className="flex items-center gap-3">
          <span aria-hidden className="grid h-9 w-9 place-items-center bg-ink text-paper font-display text-lg">K</span>
          <div className="leading-tight">
            <p className="font-display text-base">Kenya News Agency</p>
            <p className="eyebrow !text-[0.6rem]">Digital Archive</p>
          </div>
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Kenya News Agency</p>
      </div>

      {/* Photo side */}
      <div className="relative hidden lg:block">
        <img src={photo.image} alt={photo.title} className="bw absolute inset-0 h-full w-full object-cover" />
        <div className="watermark absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-paper">
          <p className="eyebrow !text-paper/70">From the archive</p>
          <p className="mt-3 font-display text-2xl leading-snug max-w-md">"{photo.caption}"</p>
          <p className="mt-4 text-sm text-paper/70">
            {photo.photographer} — {photo.location}, {photo.year}
          </p>
        </div>
      </div>
    </div>
  );
}
