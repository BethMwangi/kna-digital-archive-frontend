import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/reset")({
  head: () => ({ meta: [{ title: "Reset password — KNA Digital Archive" }] }),
  component: () => (
    <div>
      <p className="eyebrow">Choose a new password</p>
      <h1 className="mt-3 font-display text-4xl">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your reset link is verified. Choose a new password to continue.</p>
      <form className="mt-6 space-y-4">
        <div>
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="pw2">Confirm password</Label>
          <Input id="pw2" type="password" className="mt-1.5" />
        </div>
        <Button className="w-full rounded-none bg-ink text-paper hover:bg-ink/90" size="lg">Update password</Button>
      </form>
      <p className="mt-8 text-sm text-muted-foreground">
        <Link to="/auth/login" className="text-foreground underline underline-offset-4">Back to sign in</Link>
      </p>
    </div>
  ),
});
