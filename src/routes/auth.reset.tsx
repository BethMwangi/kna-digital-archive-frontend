import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle, KeyRound, Loader2 } from "lucide-react";

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
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validation/auth";
import { useForgotPassword, useResetPassword } from "@/hooks/use-auth-mutations";
import { applyApiErrorToForm } from "@/lib/api/form-errors";

const searchSchema = z.object({
  // Prefilled straight out of /auth/forgot, same pattern as
  // auth.verify.tsx's ?email= — stays editable for anyone landing here cold.
  email: z.string().optional(),
});

export const Route = createFileRoute("/auth/reset")({
  head: () => ({ meta: [{ title: "Reset password — Urithi Digital Archive" }] }),
  validateSearch: (search) => searchSchema.parse(search),
  component: ResetPasswordPage,
});

// Purely a client-side spam guard between resend clicks — the backend's own
// throttle is the real limit, this just avoids obviously-wasted requests.
const RESEND_COOLDOWN_S = 30;

function ResetPasswordPage() {
  const { email: emailFromSearch } = Route.useSearch();
  const navigate = useNavigate();
  const resetPassword = useResetPassword();
  const forgotPassword = useForgotPassword();
  const [formError, setFormError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromSearch ?? "",
      code: "",
      new_password: "",
      new_password_confirm: "",
    },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const onSubmit = form.handleSubmit((values) => {
    setFormError("");
    resetPassword.mutate(values, {
      onSuccess: () => navigate({ to: "/auth/login" }),
      onError: (error) => setFormError(applyApiErrorToForm(error, form.setError)),
    });
  });

  const handleResend = () => {
    const email = form.getValues("email");
    if (cooldown > 0 || !email || !z.string().email().safeParse(email).success) {
      form.trigger("email");
      return;
    }
    forgotPassword.mutate(
      { email },
      {
        // Always the same response whether or not the account exists
        // (anti-enumeration) — success just means the request went out.
        onSuccess: () => {
          toast.success("If that email is registered, a new code has been sent.");
          setCooldown(RESEND_COOLDOWN_S);
        },
        onError: () => toast.error("Couldn't resend right now. Please try again shortly."),
      },
    );
  };

  return (
    <div>
      <div className="grid h-12 w-12 place-items-center bg-paper-warm text-foreground">
        <KeyRound className="h-5 w-5" />
      </div>
      <p className="eyebrow mt-6">Account recovery</p>
      <h1 className="mt-3 font-display text-4xl">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the 6-digit code we sent to your email or phone number, then choose a new password.
      </p>

      {formError && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Couldn't reset password</AlertTitle>
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
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="new_password_confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
            size="lg"
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </Form>

      <Button
        variant="outline"
        className="mt-4 w-full rounded-none"
        onClick={handleResend}
        disabled={forgotPassword.isPending || cooldown > 0}
      >
        {forgotPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
