import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";
import { AlertCircle, Loader2, ShieldAlert } from "lucide-react";

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
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validation/auth";
import { useResetPassword } from "@/hooks/use-auth-mutations";
import { applyApiErrorToForm } from "@/lib/api/form-errors";

const searchSchema = z.object({
  uid: z.string().optional(),
  token: z.string().optional(),
});

export const Route = createFileRoute("/auth/reset")({
  head: () => ({ meta: [{ title: "Reset password — KNA Digital Archive" }] }),
  validateSearch: (search) => searchSchema.parse(search),
  component: ResetPasswordPage,
});

function InvalidLink() {
  return (
    <div>
      <div className="grid h-12 w-12 place-items-center bg-paper-warm text-flag-red">
        <ShieldAlert className="h-5 w-5" />
      </div>
      <p className="eyebrow mt-6">Link problem</p>
      <h1 className="mt-3 font-display text-4xl">Invalid reset link</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This password reset link is incomplete or malformed. Request a new one to continue.
      </p>
      <p className="mt-8 text-sm text-muted-foreground">
        <Link to="/auth/forgot" className="text-foreground underline underline-offset-4">
          Request a new link
        </Link>
      </p>
    </div>
  );
}

function ResetPasswordPage() {
  const { uid, token } = Route.useSearch();
  const navigate = useNavigate();
  const resetPassword = useResetPassword();
  const [formError, setFormError] = useState("");

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  if (!uid || !token) {
    return <InvalidLink />;
  }

  const onSubmit = form.handleSubmit((values) => {
    setFormError("");
    resetPassword.mutate(
      { uid, token, new_password: values.new_password },
      {
        onSuccess: () => {
          navigate({ to: "/auth/login" });
        },
        onError: (error) => setFormError(applyApiErrorToForm(error, form.setError)),
      },
    );
  });

  return (
    <div>
      <p className="eyebrow">Choose a new password</p>
      <h1 className="mt-3 font-display text-4xl">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your reset link is verified. Choose a new password to continue.
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
            name="confirm_password"
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
            className="w-full rounded-none bg-ink text-paper hover:bg-ink/90"
            size="lg"
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
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
