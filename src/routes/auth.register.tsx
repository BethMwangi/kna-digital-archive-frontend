import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Create account — KNA Digital Archive" }] }),
  component: RegisterPage,
});

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function RegisterPage() {
  const [pw, setPw] = useState("");
  const s = strength(pw);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  return (
    <div>
      <p className="eyebrow">Join the archive</p>
      <h1 className="mt-3 font-display text-4xl">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Individual account · Free to browse, pay per license.</p>

      <form className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="fn">First name</Label>
            <Input id="fn" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="ln">Last name</Label>
            <Input id="ln" className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="em">Email</Label>
          <Input id="em" type="email" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="ph">Phone</Label>
          <div className="mt-1.5 flex">
            <span className="inline-flex items-center border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">+254</span>
            <Input id="ph" placeholder="712 000 000" className="rounded-none" />
          </div>
        </div>
        <div>
          <Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1.5" />
          <p className="mt-2 text-[0.7rem] text-muted-foreground">Minimum 10 characters, mixing case, numbers and symbols.</p>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cn("h-1", i < s ? (s <= 1 ? "bg-flag-red" : s === 2 ? "bg-amber-500" : "bg-[oklch(0.55_0.14_150)]") : "bg-border")} />
            ))}
          </div>
          {pw && <p className="mt-1 text-[0.7rem] text-muted-foreground">Strength: <span className="text-foreground">{labels[s]}</span></p>}
        </div>
        <div>
          <Label htmlFor="pw2">Confirm password</Label>
          <Input id="pw2" type="password" className="mt-1.5" />
        </div>
        <Button className="w-full rounded-none bg-ink text-paper hover:bg-ink/90" size="lg">Create account</Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-foreground underline underline-offset-4">Sign in</Link>
      </p>
    </div>
  );
}
