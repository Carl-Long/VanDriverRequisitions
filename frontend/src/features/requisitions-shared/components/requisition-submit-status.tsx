"use client";

import { CalendarCheck, CalendarClock, CalendarX } from "lucide-react";

import { formatDateTime, timeUntil } from "@/lib/format/date";
import type { SubmitWindowStatus } from "@/features/submit-windows/types/submit-window.types";

type Props = {
    loading: boolean;
    status: SubmitWindowStatus | null;
};

export function RequisitionSubmitStatus({ status, loading }: Readonly<Props>) {
    if (loading || !status) {
        return null;
    }

    if (status.currentWindow) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-success-border bg-success-surface p-3 text-xs font-semibold">
                <CalendarCheck className="size-[1.2em] text-success" />

                <span>
                    Submission window open until {formatDateTime(status.currentWindow.openTo)}
                </span>
            </span>
        );
    }

    if (status.nextWindow) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-info-border bg-info-surface p-2 text-xs">
                <CalendarClock className="size-[1.2em] text-info" />

                <span>Submission window opens in {timeUntil(status.nextWindow.openFrom)}</span>
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-warning-border bg-warning-surface p-2 text-xs">
            <CalendarX className="size-[1.2em] text-warning" />

            <span>No submission window scheduled</span>
        </span>
    );
}