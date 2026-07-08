import type { ReactNode } from "react";
import { SiteHeader, SiteFooter } from "@/components/kna/site-chrome";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
