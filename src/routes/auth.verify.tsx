import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { verifyEmailSchema, type VerifyEmailFormValues } from "@/lib/validation/auth";
import { useResendVerification, useVerifyEmail } from "@/hooks/use-auth-mutations";
import { applyApiErrorToForm } from "@/lib/api/form-errors";

const searchSchema = z.object({
  email: z.string().optional(),
});

export const Route = createFileRoute("/auth/verify")({
  head: () => ({ meta: [{ title: "Verify email — Urithi Digital Archive" }] }),
  validateSearch: (search) => searchSchema.parse(search),
  component: VerifyEmailPage,
});

// Purely a client-side spam guard between resend clicks — the backend's own
// throttle is the real limit, this just avoids obviously-wasted requests.
const RESEND_COOLDOWN_S = 30;

/**
 * The backend now verifies via a 6-digit code emailed to the address at
 * registration (accounts/api.py EmailVerifyView), not a uid/token link — so
 * this collects {email, code} and POSTs it, instead of auto-submitting a
 * query-string pair. `email` arrives prefilled via ?email= straight out of
 * registration, but the field stays editable so someone who lands here cold
 * (closed the tab, opened this page from a bookmark) can still complete it.
 */
function VerifyEmailPage() {
  const { email: emailFromSearch } = Route.useSearch();
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  const [formError, setFormError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: emailFromSearch ?? "", code: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const onSubmit = form.handleSubmit((values) => {
    setFormError("");
    verifyEmail.mutate(values, {
      onError: (error) => setFormError(applyApiErrorToForm(error, form.setError)),
    });
  });

  const handleResend = () => {
    const email = form.getValues("email");
    if (cooldown > 0 || !email || !z.string().email().safeParse(email).success) {
      form.trigger("email");
      return;
    }
    resendVerification.mutate(
      { email },
      {
        // Always the same response whether or not the account exists/is
        // already verified (anti-enumeration) — success just means the
        // request went out.
        onSuccess: () => {
          toast.success("If that email is registered, a new code has been sent.");
          setCooldown(RESEND_COOLDOWN_S);
        },
        onError: () => toast.error("Couldn't resend right now. Please try again shortly."),
      },
    );
  };

  if (verifyEmail.isSuccess) {
    return (
      <div>
        <div className="grid h-12 w-12 place-items-center bg-paper-warm text-[oklch(0.45_0.14_150)]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="eyebrow mt-6">All set</p>
        <h1 className="mt-3 font-display text-4xl">Email verified</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your address is confirmed. You can now sign in.
        </p>
        <Button
          asChild
          className="mt-8 rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
          size="lg"
        >
          <Link to="/auth/login">Continue to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid h-12 w-12 place-items-center bg-paper-warm text-foreground">
        <Mail className="h-5 w-5" />
      </div>
      <p className="eyebrow mt-6">Confirm it's you</p>
      <h1 className="mt-3 font-display text-4xl">Enter your code</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We emailed a 6-digit verification code to your address. Enter it below to confirm your
        account.
      </p>

      {formError && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Couldn't verify</AlertTitle>
          <AlertDescription className="text-xs">{formError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification code</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
            size="lg"
            disabled={verifyEmail.isPending}
          >
            {verifyEmail.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify email
          </Button>
        </form>
      </Form>

      <Button
        variant="outline"
        className="mt-4 w-full rounded-none"
        onClick={handleResend}
        disabled={resendVerification.isPending || cooldown > 0}
      >
        {resendVerification.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't get a code? Resend"}
      </Button>

      <p className="mt-8 text-sm text-muted-foreground">
        <Link to="/auth/login" className="text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
