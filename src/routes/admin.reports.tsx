import { createFileRoute } from "@tanstack/react-router";
import { formatKES } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Urithi Admin" }] }),
  component: () => (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Analytics</p>
        <h1 className="mt-2 font-display text-4xl">Reports</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Downloadable reports for finance, licensing and archival KPIs.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Revenue · YTD", v: formatKES(18420000) },
          { label: "Orders · YTD", v: "3,842" },
          { label: "Avg order value", v: formatKES(4800) },
          { label: "Assets added", v: "1,208" },
        ].map((s) => (
          <div key={s.label} className="border border-border bg-paper-warm p-5">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-3 font-display text-3xl tabular-nums">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="border border-dashed border-border bg-paper-warm p-10 text-center text-sm text-muted-foreground">
        Revenue by month · License mix · Top photographers — chart panels render here (TODO: wire
        /api/v1/reports).
      </div>
    </div>
  ),
});
