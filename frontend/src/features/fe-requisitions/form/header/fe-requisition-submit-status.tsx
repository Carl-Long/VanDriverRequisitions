"use client";

import {
    CalendarCheck,
    CalendarClock,
    CalendarX,
} from "lucide-react";

import {
    formatDateTime,
    timeUntil,
} from "@/lib/format/date";

type Props = {
    loading: boolean;
    status: {
        currentWindow?: {
            openTo: string;
        } | null;
        nextWindow?: {
            openFrom: string;
        } | null;
    } | null;
};

export function FeRequisitionSubmitStatus({
    status,
    loading,
}: Readonly<Props>) {
    if (loading || !status) {
        return null;
    }

    if (status.currentWindow) {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs rounded-xl border border-success-border bg-success-surface p-3 font-semibold">
                <CalendarCheck size={14} className="text-success" />

                <span>
                    Submission window open until{" "}
                    {formatDateTime(
                        status.currentWindow.openTo,
                    )}
                </span>
            </span>
        );
    }

    if (status.nextWindow) {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs rounded-xl border border-info-border bg-info-surface p-2 ">
                <CalendarClock size={14} className="text-info" />

                <span>
                    Submission window opens in{" "}
                    {timeUntil(
                        status.nextWindow.openFrom,
                    )}
                </span>
            </span>
        );
    }

    return (
            <span className="inline-flex items-center gap-1.5 text-xs rounded-xl border border-warning-border bg-warning-surface p-2 ">
            <CalendarX size={14} className="text-warning" />

            <span>
                No submission window scheduled
            </span>
        </span>
    );
}