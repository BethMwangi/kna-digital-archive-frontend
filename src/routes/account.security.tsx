import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validation/auth";
import { useChangePassword } from "@/hooks/use-account";
import { applyApiErrorToForm } from "@/lib/api/form-errors";

export const Route = createFileRoute("/account/security")({
  head: () => ({ meta: [{ title: "Security — Urithi account" }] }),
  component: Security,
});

function Security() {
  const changePassword = useChangePassword();
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "", new_password_confirm: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError("");
    setSaved(false);
    changePassword.mutate(values, {
      onSuccess: () => {
        setSaved(true);
        form.reset();
      },
      onError: (error) => setFormError(applyApiErrorToForm(error, form.setError)),
    });
  });

  return (
    <div>
      <p className="eyebrow">Access & credentials</p>
      <h1 className="mt-2 font-display text-4xl">Security</h1>

      <div className="mt-8 max-w-2xl space-y-10">
        <section>
          <h2 className="font-display text-xl border-b border-border pb-2">Change password</h2>

          {formError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle className="text-sm">Couldn't change password</AlertTitle>
              <AlertDescription className="text-xs">{formError}</AlertDescription>
            </Alert>
          )}
          {saved && !formError && (
            <Alert className="mt-4 border-[oklch(0.55_0.14_150)]/30 bg-[oklch(0.55_0.14_150)]/5">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle className="text-sm">Password updated</AlertTitle>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
              <FormField
                control={form.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Current password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        className="mt-1.5"
                        {...field}
                      />
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
                    <FormLabel className="text-xs">New password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        className="mt-1.5"
                        {...field}
                      />
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
                    <FormLabel className="text-xs">Confirm new password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        className="mt-1.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="rounded-none bg-ink text-paper hover:bg-ink/90"
                disabled={changePassword.isPending}
              >
                {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </form>
          </Form>
        </section>
      </div>
    </div>
  );
}
