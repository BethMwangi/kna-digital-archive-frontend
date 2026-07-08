import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/account/security")({
  head: () => ({ meta: [{ title: "Security — KNA account" }] }),
  component: Security,
});

function Security() {
  return (
    <div>
      <p className="eyebrow">Access & credentials</p>
      <h1 className="mt-2 font-display text-4xl">Security</h1>

      <div className="mt-8 max-w-2xl space-y-10">
        <section>
          <h2 className="font-display text-xl border-b border-border pb-2">Change password</h2>
          <form className="mt-4 space-y-4">
            <Field label="Current password" type="password" />
            <Field label="New password" type="password" />
            <Field label="Confirm new password" type="password" />
            <Button className="rounded-none bg-ink text-paper hover:bg-ink/90">Update password</Button>
          </form>
        </section>

        <section>
          <h2 className="font-display text-xl border-b border-border pb-2">Two-factor authentication</h2>
          <div className="mt-4 flex items-start justify-between gap-6 border border-border bg-paper-warm p-4">
            <div>
              <p className="font-medium">SMS 2FA</p>
              <p className="mt-1 text-sm text-muted-foreground">Receive a one-time code on +254 712 000 000 when signing in from a new device.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </section>
      </div>
    </div>
  );
}
function Field({ label, ...rest }: React.ComponentProps<typeof Input> & { label: string }) {
  const id = `s-${label}`;
  return (
    <div>
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <Input id={id} {...rest} className="mt-1.5" />
    </div>
  );
}
