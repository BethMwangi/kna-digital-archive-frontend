import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { SiteShell } from "@/components/kna/site-shell";
import { ArchiveBrowser } from "@/components/kna/browse-page";
import { validateArchiveSearch } from "@/lib/archive-search";
import { ArrowLeft, ArrowRight } from "lucide-react";
import heroSlide1 from "@/assets/1215_192-KNAPHT-1-03-000542-253.jpg";
import heroSlide2 from "@/assets/1413_208-KNAPHT-1-08-000515-7.jpg";
import heroSlide3 from "@/assets/143_16-KNAPHT-1-03-000531-264.jpg";
import heroSlide4 from "@/assets/301_471-KNAPHT-2-14-003695-98.jpg";
import heroSlide5 from "@/assets/327_9-KNAPHT-1-08-000571-36.jpg";
import heroSlide6 from "@/assets/564_119-KNAPHT-3-10-000947-330.jpg";

// Real archival photographs for the auto-advancing hero carousel (built to
// take any number of slides) — converted from the archive's TIFF scans.
const HERO_SLIDES = [heroSlide1, heroSlide2, heroSlide3, heroSlide4, heroSlide5, heroSlide6];

const HERO_AUTOPLAY_MS = 4500;

function HeroCarousel({ images }: { images: string[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (!emblaApi) return;
    const id = setInterval(() => emblaApi.scrollNext(), HERO_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [emblaApi]);

  return (
    // Mounted-print framing — a warm paper mat around a softly rounded photo
    // suits the old black-and-white material better than a hard edge-to-edge
    // crop, while staying in the same paper tone as the rest of the hero.
    <div className="h-60 w-full rounded-xl bg-paper/70 p-2 shadow-sm sm:h-80 md:h-[30rem] md:p-3">
      <div className="relative h-full w-full overflow-hidden rounded-lg ring-1 ring-ink/10">
        <div ref={emblaRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {images.map((src, i) => (
              <div key={i} className="h-full min-w-0 shrink-0 grow-0 basis-full">
                <img src={src} alt="" aria-hidden className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink shadow-md transition hover:bg-paper"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink shadow-md transition hover:bg-paper"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Urithi — Kenya's history, preserved and licensed" },
      {
        name: "description",
        content:
          "Search 20,000+ historical photographs, newspapers and audiovisual records from Kenya's national press archive. License editorial, commercial, educational and government use.",
      },
    ],
  }),
  validateSearch: validateArchiveSearch,
  component: HomePage,
});

const SHOP_ANCHOR = "shop";

function HomePage() {
  return (
    <SiteShell>
      {/* HERO — full-width archival photo carousel; search lives in the shop below */}
      <section className="relative overflow-hidden bg-gradient-to-br from-flag-green-soft via-paper-warm to-flag-red-soft">
        {/* Visually hidden — the page's h1 for SEO/screen readers; the hero
            is image-only on screen, per design, with no text over it. */}
        <h1 className="sr-only">Kenya's history, preserved and licensed.</h1>
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          <HeroCarousel images={HERO_SLIDES} />
        </div>
      </section>

      {/* The shop — search, filters and the full image grid, right on the home page */}
      <ArchiveBrowser to="/" id={SHOP_ANCHOR} />
    </SiteShell>
  );
}
