"use client";

import { SubmitWindowHero } from "@/components/submit-windows/submit-window-hero";
import { useSubmitWindowStatus } from "@/hooks/use-submit-window-status";

export function SubmitWindowHeroCompact() {
  const {
    status,
    loading,
  } = useSubmitWindowStatus();

  return (
    <SubmitWindowHero
      status={status}
      loading={loading}
      variant="compact"
    />
  );
}