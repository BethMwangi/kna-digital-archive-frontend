import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account/profile")({
  head: () => ({ meta: [{ title: "Profile — KNA account" }] }),
  component: Profile,
});

function Profile() {
  return (
    <div>
      <p className="eyebrow">Account details</p>
      <h1 className="mt-2 font-display text-4xl">Profile</h1>

      <form className="mt-8 max-w-2xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" defaultValue="Wanjiku" />
          <Field label="Last name" defaultValue="Kamau" />
        </div>
        <Field label="Email" type="email" defaultValue="wanjiku@example.co.ke" />
        <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
          <Field label="Country code" defaultValue="+254" />
          <Field label="Phone" defaultValue="712 000 000" />
        </div>
        <Field label="Organisation" defaultValue="Nation Media Group" />
        <div className="flex gap-3 border-t border-border pt-6">
          <Button className="rounded-none bg-ink text-paper hover:bg-ink/90">Save changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, ...rest }: React.ComponentProps<typeof Input> & { label: string }) {
  const id = `p-${label}`;
  return (
    <div>
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input id={id} {...rest} className="mt-1.5" />
    </div>
  );
}
