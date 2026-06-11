"use client";

import { useSubmitWindowStatus } from "@/features/submit-windows/hooks/use-submit-window-status";
import { SubmitWindowHero } from "./submit-window-hero";

export function SubmitWindowHeroCompact() {
    const { status, loading } = useSubmitWindowStatus();

    return <SubmitWindowHero status={status} loading={loading} variant="compact" />;
}
