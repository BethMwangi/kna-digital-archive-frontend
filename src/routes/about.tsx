import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/kna/site-shell";
import { SectionHeader } from "@/components/kna/components";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Kenya News Agency — Urithi" },
      {
        name: "description",
        content:
          "Kenya News Agency (KNA) is the flagship of the Department of Information — its history, network, mandate, vision and mission.",
      },
    ],
  }),
  component: AboutPage,
});

const SECTIONS = [
  {
    title: "National Editorial Desk",
    body: "Receives, processes, packages and disseminates news and information to subscribers.",
  },
  {
    title: "Field Services",
    body: "Generates content — news, features, photographs and video footage — for onward transmission to the National Editorial Desk.",
  },
  {
    title: "Press Center",
    body: "Generates content — video footage, photos and scripts — and packages and files it to the National Editorial Desk for onward transmission to subscribers. Also provides coverage and documents events for Government Ministries, Departments and Agencies (MDAs).",
  },
  {
    title: "Photographic Section",
    body: "Captures, processes, and sends photographs to the National Editorial Desk for onward transmission to subscribers. Also provides photographic services to MDAs.",
  },
];

const PILLARS = [
  {
    title: "Mandate",
    body: "Provide information to citizens to make informed decisions.",
  },
  {
    title: "Vision",
    body: "To be the leading news and information source globally.",
  },
  {
    title: "Mission",
    body: "To gather and disseminate news and information for national development in line with Vision 2030.",
  },
];

function AboutPage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="border-b border-border bg-paper-warm">
        <div className="mx-auto max-w-4xl px-4 py-20 md:px-8">
          <p className="eyebrow">Institution</p>
          <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">
            Kenya News Agency
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Kenya News Agency (KNA) is the flagship of the Department of Information. Established in
            1963 as a medium for building the nascent nation, its main objective was to create a
            common Kenyan identity through a coherent and cohesive voice.
          </p>
        </div>
      </section>

      {/* History */}
      <section className="mx-auto max-w-4xl px-4 py-20 md:px-8">
        <SectionHeader eyebrow="Our history" title="From wartime information service to KNA" />
        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <p>
            KNA gathered, processed, and disseminated local print and electronic news using the
            Kenyan narrative, complementing the then Voice of Kenya (VOK) — now the Kenya
            Broadcasting Corporation (KBC) — to propagate the Government's development agenda.
          </p>
          <p>
            Its predecessor, the Kenya Information Service (KIS), was formed in 1939 to disseminate
            information on World War II and was wound up in 1945.
          </p>
        </div>
      </section>

      {/* Network */}
      <section className="border-t border-border bg-paper-warm">
        <div className="mx-auto max-w-4xl px-4 py-20 md:px-8">
          <SectionHeader eyebrow="Reach" title="A nationwide network" />
          <div className="grid gap-10 sm:grid-cols-3">
            {[
              { n: "47", label: "County offices" },
              { n: "25", label: "Sub-county offices" },
              { n: "24", label: "County Information Resource Centers" },
            ].map((s) => (
              <div key={s.label} className="border-t border-ink pt-4">
                <p className="font-display text-4xl">{s.n}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 space-y-5 text-sm text-muted-foreground leading-relaxed">
            <p>
              The Agency also disseminates electronic news and information to local and
              international subscribers. Its County Information Resource Centers (IRCs) and 11
              Regional Publications are focal points for content gathering and dissemination.
            </p>
            <p>
              This countrywide network gives KNA a competitive advantage over other media
              organizations. Its presence at the national, county and sub-county levels makes the
              Agency a veritable nerve center for gathering, packaging, processing, and
              disseminating news and information on Government policies, projects, programmes, and
              initiatives to the Kenyan public.
            </p>
          </div>
        </div>
      </section>

      {/* Four sections */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <SectionHeader eyebrow="How KNA works" title="Four sections" />
        <div className="grid gap-10 sm:grid-cols-2">
          {SECTIONS.map((s, i) => (
            <div key={s.title} className="border-t border-ink pt-6">
              <p className="font-display text-4xl">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-6 font-display text-2xl">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mandate / Vision / Mission */}
      <section className="border-t border-border bg-paper-warm">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <SectionHeader eyebrow="What guides us" title="Mandate, vision & mission" />
          <div className="grid gap-10 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="border-t border-ink pt-6">
                <h3 className="font-display text-2xl">{p.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section className="mx-auto max-w-4xl px-4 py-20 md:px-8">
        <SectionHeader eyebrow="Get in touch" title="Contacts" />
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-16">
          <div>
            <p className="eyebrow">Address</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Uchumi House, 4th Floor
              <br />
              Nairobi, Kenya
            </p>
          </div>
          <div>
            <p className="eyebrow">Email</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>
                <a
                  href="mailto:kna@information.go.ke"
                  className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" /> kna@information.go.ke
                </a>
              </li>
              <li>
                <a
                  href="mailto:di@information.go.ke"
                  className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5" /> di@information.go.ke
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
