import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { profileSchema, type ProfileFormValues } from "@/lib/validation/auth";
import { useMe, useUpdateProfile } from "@/hooks/use-account";
import { applyApiErrorToForm } from "@/lib/api/form-errors";

export const Route = createFileRoute("/account/profile")({
  head: () => ({ meta: [{ title: "Profile — KNA account" }] }),
  component: Profile,
});

function Profile() {
  const { data: user, isLoading } = useMe();
  const updateProfile = useUpdateProfile();
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: "", last_name: "", phone_number: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSubmit = form.handleSubmit((values) => {
    setFormError("");
    setSaved(false);
    updateProfile.mutate(values, {
      onSuccess: () => setSaved(true),
      onError: (error) => setFormError(applyApiErrorToForm(error, form.setError)),
    });
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Account details</p>
      <h1 className="mt-2 font-display text-4xl">Profile</h1>

      {formError && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle className="text-sm">Couldn't save changes</AlertTitle>
          <AlertDescription className="text-xs">{formError}</AlertDescription>
        </Alert>
      )}
      {saved && !formError && (
        <Alert className="mt-6 border-[oklch(0.55_0.14_150)]/30 bg-[oklch(0.55_0.14_150)]/5">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle className="text-sm">Saved</AlertTitle>
          <AlertDescription className="text-xs">Your profile has been updated.</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-6" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">First name</FormLabel>
                  <FormControl>
                    <Input className="mt-1.5" {...field} />
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
                  <FormLabel className="text-xs">Last name</FormLabel>
                  <FormControl>
                    <Input className="mt-1.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <Label className="text-xs">Email</Label>
            <Input type="email" value={user?.email ?? ""} disabled className="mt-1.5" />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Email is tied to your login and can't be changed here.
            </p>
          </div>

          <PhoneField control={form.control} name="phone_number" label="Phone" />

          <div className="flex gap-3 border-t border-border pt-6">
            <Button
              type="submit"
              className="rounded-none bg-ink text-paper hover:bg-ink/90"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                user &&
                form.reset({
                  first_name: user.first_name,
                  last_name: user.last_name,
                  phone_number: user.phone_number,
                })
              }
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
