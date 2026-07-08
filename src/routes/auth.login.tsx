import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — KNA Digital Archive" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div>
      <p className="eyebrow">Access your account</p>
      <h1 className="mt-3 font-display text-4xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Continue to your KNA archive account.</p>

      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-sm">Sign-in failed</AlertTitle>
        <AlertDescription className="text-xs">Invalid credentials. Please try again or reset your password.</AlertDescription>
      </Alert>

      <form className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.co.ke" className="mt-1.5" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/auth/forgot" className="text-xs text-muted-foreground underline-offset-4 hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" className="mt-1.5" />
        </div>
        <Button className="w-full rounded-none bg-ink text-paper hover:bg-ink/90" size="lg">Sign in</Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        New to the archive?{" "}
        <Link to="/auth/register" className="text-foreground underline underline-offset-4">Create an account</Link>
      </p>
    </div>
  );
}
