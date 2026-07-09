import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2, Mail, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useVerifyEmail } from "@/hooks/use-auth-mutations";

const searchSchema = z.object({
  uid: z.string().optional(),
  token: z.string().optional(),
});

export const Route = createFileRoute("/auth/verify")({
  head: () => ({ meta: [{ title: "Verify email — KNA Digital Archive" }] }),
  validateSearch: (search) => searchSchema.parse(search),
  component: VerifyEmailPage,
});

/**
 * The backend verifies via a `uid`/`token` pair from the emailed link
 * (accounts/api.py EmailVerifyView), not an OTP code — this auto-submits
 * on mount rather than collecting a 6-digit input. There's no resend
 * endpoint in the current API surface, so "didn't get it" points at
 * support instead of a fake resend button.
 */
function VerifyEmailPage() {
  const { uid, token } = Route.useSearch();
  const verifyEmail = useVerifyEmail();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !uid || !token) return;
    attempted.current = true;
    verifyEmail.mutate({ uid, token });
  }, [uid, token, verifyEmail]);

  if (!uid || !token) {
    return (
      <div>
        <div className="grid h-12 w-12 place-items-center bg-paper-warm text-flag-red">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <p className="eyebrow mt-6">Link problem</p>
        <h1 className="mt-3 font-display text-4xl">Invalid verification link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This link is incomplete. Open the verification link from your email again, or contact
          support if it keeps failing.
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          <Link to="/auth/login" className="text-foreground underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

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
        <Button asChild className="mt-8 rounded-none bg-ink text-paper hover:bg-ink/90" size="lg">
          <Link to="/auth/login">Continue to sign in</Link>
        </Button>
      </div>
    );
  }

  if (verifyEmail.isError) {
    return (
      <div>
        <div className="grid h-12 w-12 place-items-center bg-paper-warm text-flag-red">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <p className="eyebrow mt-6">Couldn't verify</p>
        <h1 className="mt-3 font-display text-4xl">Link expired or invalid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This verification link is no longer valid. Sign in and request a new one from your
          account, or contact support.
        </p>
        <p className="mt-8 text-sm text-muted-foreground">
          <Link to="/auth/login" className="text-foreground underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid h-12 w-12 place-items-center bg-paper-warm text-foreground">
        <Mail className="h-5 w-5" />
      </div>
      <p className="eyebrow mt-6">Confirm it's you</p>
      <h1 className="mt-3 font-display text-4xl">Verifying your email</h1>
      <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Hold on, this only takes a moment.
      </p>
    </div>
  );
}
