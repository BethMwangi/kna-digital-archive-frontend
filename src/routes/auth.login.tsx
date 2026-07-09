import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useLogin } from "@/hooks/use-auth-mutations";
import { applyApiErrorToForm } from "@/lib/api/form-errors";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — KNA Digital Archive" }] }),
  validateSearch: (search) => searchSchema.parse(search),
  component: LoginPage,
});

// Exported (not just used as Route's component) so it can be rendered
// directly in tests without going through the full file-based router tree.
export function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const login = useLogin();
  const [formError, setFormError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError("");
    login.mutate(values, {
      onSuccess: (user) => {
        const isStaff = user.role === "admin" || user.role === "super_admin";
        navigate({ to: (redirect ?? (isStaff ? "/admin" : "/account")) as never });
      },
      onError: (error) => {
        setFormError(applyApiErrorToForm(error, form.setError));
      },
    });
  });

  return (
    <div>
      <p className="eyebrow">Access your account</p>
      <h1 className="mt-3 font-display text-4xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Continue to your KNA archive account.</p>

      {formError && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Sign-in failed</AlertTitle>
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
                  <Input
                    type="email"
                    placeholder="you@example.co.ke"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to="/auth/forgot"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full rounded-none bg-ink text-paper hover:bg-ink/90"
            size="lg"
            disabled={login.isPending}
          >
            {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </Form>

      <p className="mt-8 text-sm text-muted-foreground">
        New to the archive?{" "}
        <Link to="/auth/register" className="text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
