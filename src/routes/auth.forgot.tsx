import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

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
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validation/auth";
import { useForgotPassword } from "@/hooks/use-auth-mutations";
import { applyApiErrorToForm } from "@/lib/api/form-errors";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Forgot password — Urithi Digital Archive" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError("");
    forgotPassword.mutate(values, {
      // The backend always returns the same generic message whether or not
      // the email exists (anti-enumeration) — so success just means the
      // request was well-formed, not that the email was found. Hand off to
      // /auth/reset with the email prefilled, same as register -> verify.
      onSuccess: () => navigate({ to: "/auth/reset", search: { email: values.email } }),
      onError: (error) => setFormError(applyApiErrorToForm(error, form.setError)),
    });
  });

  return (
    <div>
      <p className="eyebrow">Account recovery</p>
      <h1 className="mt-3 font-display text-4xl">Forgot password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we'll send a 6-digit code to reset your password — by email, or by SMS
        too if we have a phone number on file.
      </p>

      {formError && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Couldn't send code</AlertTitle>
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
          <Button
            type="submit"
            className="w-full rounded-none bg-flag-green text-paper hover:bg-flag-green/90"
            size="lg"
            disabled={forgotPassword.isPending}
          >
            {forgotPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send code
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-sm text-muted-foreground">
        <Link to="/auth/login" className="text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
