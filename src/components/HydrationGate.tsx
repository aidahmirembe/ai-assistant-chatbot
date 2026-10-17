"use client";

import { useEffect, useState } from "react";
import { useVelaStore } from "@/lib/store";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => setReady(true);
    try {
      const persist = useVelaStore.persist;
      if (persist.hasHydrated()) {
        finish();
        return;
      }
      const unsub = persist.onFinishHydration(() => {
        finish();
      });
      void persist.rehydrate();
      return unsub;
    } catch {
      finish();
    }
  }, []);

  // Keep server + first client paint identical to avoid hydration mismatch
  if (!ready) {
    return (
      <div className="relative flex h-dvh overflow-hidden" suppressHydrationWarning>
        <div className="atmosphere" aria-hidden />
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-deep)] font-[family-name:var(--font-display)] text-xl font-bold text-white shadow-lg">
              V
            </div>
            <p className="text-sm text-[var(--muted)]">Loading Vela…</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
