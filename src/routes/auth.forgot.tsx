import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Forgot password — KNA Digital Archive" }] }),
  component: () => (
    <div>
      <p className="eyebrow">Account recovery</p>
      <h1 className="mt-3 font-display text-4xl">Forgot password</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter your email and we'll send a reset link.</p>
      <form className="mt-6 space-y-4">
        <div>
          <Label htmlFor="em">Email</Label>
          <Input id="em" type="email" className="mt-1.5" />
        </div>
        <Button className="w-full rounded-none bg-ink text-paper hover:bg-ink/90" size="lg">Send reset link</Button>
      </form>
      <p className="mt-8 text-sm text-muted-foreground">
        <Link to="/auth/login" className="text-foreground underline underline-offset-4">Back to sign in</Link>
      </p>
    </div>
  ),
});
