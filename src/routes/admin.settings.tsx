import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Urithi Admin" }] }),
  component: () => (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="eyebrow">System</p>
        <h1 className="mt-2 font-display text-4xl">Settings</h1>
      </div>
      <section className="space-y-4">
        <h2 className="font-display text-xl border-b border-border pb-2">Institution</h2>
        <div>
          <Label>Display name</Label>
          <Input className="mt-1.5" defaultValue="Urithi Digital Archive" />
        </div>
        <div>
          <Label>Support email</Label>
          <Input className="mt-1.5" defaultValue="archive@urithi.co.ke" />
        </div>
      </section>
      <Button className="rounded-none bg-ink text-paper hover:bg-ink/90">Save settings</Button>
    </div>
  ),
});
