import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/auth/verify")({
  head: () => ({ meta: [{ title: "Verify email — KNA Digital Archive" }] }),
  component: () => (
    <div>
      <div className="grid h-12 w-12 place-items-center bg-paper-warm text-foreground">
        <Mail className="h-5 w-5" />
      </div>
      <p className="eyebrow mt-6">Confirm it's you</p>
      <h1 className="mt-3 font-display text-4xl">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">We sent a 6-digit code to <span className="text-foreground">wanjiku@example.co.ke</span>.</p>

      <form className="mt-8 space-y-6">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button className="w-full rounded-none bg-ink text-paper hover:bg-ink/90" size="lg">Verify</Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Didn't receive it? <button className="text-foreground underline underline-offset-4">Resend code</button>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        <Link to="/auth/login" className="text-foreground underline underline-offset-4">Back to sign in</Link>
      </p>
    </div>
  ),
});
