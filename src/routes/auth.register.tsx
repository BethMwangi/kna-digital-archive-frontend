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
import { PhoneField } from "@/components/kna/phone-field";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth";
import { useRegister } from "@/hooks/use-auth-mutations";
import { applyApiErrorToForm } from "@/lib/api/form-errors";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Create account — Urithi Digital Archive" }] }),
  component: RegisterPage,
});

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function RegisterPage() {
  const register = useRegister();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
      password_confirm: "",
    },
  });

  const pw = form.watch("password");
  const s = strength(pw);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];

  const onSubmit = form.handleSubmit((values) => {
    setFormError("");
    register.mutate(values, {
      // The code to verify with is emailed, not returned here — hand off to
      // /auth/verify with the address prefilled so the user isn't asked to
      // retype what they just typed.
      onSuccess: (user) => navigate({ to: "/auth/verify", search: { email: user.email } }),
      onError: (error) => setFormError(applyApiErrorToForm(error, form.setError)),
    });
  });

  return (
    <div>
      <p className="eyebrow">Join the archive</p>
      <h1 className="mt-3 font-display text-4xl">Create account</h1>
      {/* <p className="mt-2 text-sm text-muted-foreground">Create an account with us</p> */}

      {formError && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Couldn't create account</AlertTitle>
          <AlertDescription className="text-xs">{formError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <PhoneField control={form.control} name="phone_number" />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <p className="mt-2 text-[0.7rem] text-muted-foreground">
                  Minimum 8 characters. Avoid common passwords or ones similar to your name/email.
                </p>
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1",
                        i < s
                          ? s <= 1
                            ? "bg-flag-red"
                            : s === 2
                              ? "bg-amber-500"
                              : "bg-[oklch(0.55_0.14_150)]"
                          : "bg-border",
                      )}
                    />
                  ))}
                </div>
                {pw && (
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    Strength: <span className="text-foreground">{labels[s]}</span>
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password_confirm"
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
            disabled={register.isPending}
          >
            {register.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
