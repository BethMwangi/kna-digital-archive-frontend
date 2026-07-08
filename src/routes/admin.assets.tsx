import { createFileRoute } from "@tanstack/react-router";
import { assets, formatKES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Upload, Filter, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/admin/assets")({
  head: () => ({ meta: [{ title: "Assets — KNA Admin" }] }),
  component: AdminAssets,
});

const statuses = ["Draft", "Review", "Published", "Archived"] as const;
type Status = (typeof statuses)[number];
const statusStyles: Record<Status, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  Review: "bg-amber-100 text-amber-900 border-amber-200",
  Published: "bg-[oklch(0.55_0.14_150)]/10 text-[oklch(0.35_0.14_150)] border-[oklch(0.55_0.14_150)]/30",
  Archived: "bg-flag-red/10 text-flag-red border-flag-red/30",
};

function AdminAssets() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Content library</p>
          <h1 className="mt-2 font-display text-4xl">Assets</h1>
          <p className="mt-2 text-sm text-muted-foreground">20,847 records catalogued · 384 pending review</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-1.5 h-3 w-3" /> Filters</Button>
          <UploadDialog />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-y border-border bg-paper-warm px-4 py-2">
        <Checkbox id="all" />
        <Label htmlFor="all" className="text-xs">Select all</Label>
        <span className="text-xs text-muted-foreground">3 selected</span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs">Publish</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs">Archive</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs text-flag-red border-flag-red/30">Delete</Button>
        </div>
      </div>

      <div className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-warm">
              <TableHead className="w-8"><Checkbox /></TableHead>
              <TableHead>Record</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Photographer</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">From</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((a, i) => {
              const st = statuses[i % statuses.length];
              return (
                <TableRow key={a.id}>
                  <TableCell><Checkbox defaultChecked={i < 3} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="watermark h-10 w-14 shrink-0 overflow-hidden bg-ink">
                        <img src={a.image} alt="" className="bw h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{a.category}</TableCell>
                  <TableCell className="text-sm">{a.photographer}</TableCell>
                  <TableCell className="text-sm tabular-nums">{a.year}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[0.65rem] uppercase tracking-wider", statusStyles[st])}>{st}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">{formatKES(a.priceFrom)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function UploadDialog() {
  const [step, setStep] = useState(1);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-none bg-ink text-paper hover:bg-ink/90"><Plus className="mr-1.5 h-3 w-3" /> New asset</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">New asset · Step {step} of 4</DialogTitle>
          <DialogDescription>Add a record to the archive. Draft is saved automatically.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 border-b border-border pb-4 text-xs">
          {["File", "Metadata", "Pricing & Licenses", "Publish"].map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={label} className={cn("flex items-center gap-2", active ? "text-foreground" : "text-muted-foreground")}>
                <span className={cn("grid h-5 w-5 place-items-center rounded-full text-[0.65rem]",
                  done ? "bg-ink text-paper" : active ? "border border-ink" : "border border-border")}>{n}</span>
                <span>{label}</span>
                {n < 4 && <span className="mx-2 text-muted-foreground/50">/</span>}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="grid place-items-center border border-dashed border-border bg-paper-warm py-16 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-display text-lg">Drop a TIFF, JPEG, PDF or video</p>
            <p className="mt-1 text-xs text-muted-foreground">Up to 500 MB · Archival originals recommended</p>
            <Button variant="outline" size="sm" className="mt-4">Choose file</Button>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Title</Label><Input className="mt-1.5" placeholder="President Kenyatta addresses…" /></div>
            <div className="sm:col-span-2"><Label>Caption</Label><Textarea className="mt-1.5" rows={2} /></div>
            <div><Label>Photographer</Label><Input className="mt-1.5" /></div>
            <div><Label>Date</Label><Input type="date" className="mt-1.5" /></div>
            <div><Label>Location</Label><Input className="mt-1.5" /></div>
            <div><Label>County</Label><Input className="mt-1.5" /></div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Licenses offered</Label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {["Editorial", "Commercial", "Educational", "Government", "Internal Use"].map((l) => (
                  <label key={l} className="flex items-center gap-2 border border-border bg-background p-2 text-sm">
                    <Checkbox defaultChecked={l !== "Internal Use"} /> {l}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Web", "Print", "Archive"].map((t) => (
                <div key={t}>
                  <Label>{t} price (KES)</Label>
                  <Input type="number" className="mt-1.5" defaultValue={t === "Web" ? 1500 : t === "Print" ? 4500 : 12000} />
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <Label>Publish status</Label>
            <Select defaultValue="Review">
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="mt-3 text-xs text-muted-foreground">Records set to Review will be visible in the editorial queue for approval by an Administrator.</p>
          </div>
        )}

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Back</Button>
          {step < 4 ? (
            <Button className="rounded-none bg-ink text-paper hover:bg-ink/90" onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button className="rounded-none bg-ink text-paper hover:bg-ink/90">Save & queue</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
