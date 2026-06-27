"use client";

import { CalendarClock, CalendarCheck, CalendarX, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { timeUntil, formatDateTime } from "@/lib/format/date";
import { SubmitWindowStatus } from "../types/submit-window.types";

type SubmitWindowHeroProps = {
    status: SubmitWindowStatus | null;
    loading: boolean;
    refreshing?: boolean;
    variant?: "full" | "compact";
};

const copy = {
    open: "Submission window is open.",
    next: (time: string) =>
        `Next submission window opens ${time === "soon" ? "soon" : `in ${time}`}.`,
    none: "No upcoming submission windows. You can save requisitions but not submit.",
    noneStrict:
        "An admin must set one before submissions are possible.",
};

function getWindowState(status: SubmitWindowStatus) {
    if (status.currentWindow) {
        return {
            type: "open" as const,
            openFrom: status.currentWindow.openFrom,
            openTo: status.currentWindow.openTo,
        };
    }

    if (status.nextWindow) {
        const opensIn = timeUntil(status.nextWindow.openFrom);

        return {
            type: "next" as const,
            openFrom: status.nextWindow.openFrom,
            openTo: status.nextWindow.openTo,
            opensIn,
        };
    }

    return {
        type: "none" as const,
    };
}

function UpdatingIndicator() {
    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Loader2 className="size-[0.95em] animate-spin" />
            Updating...
        </div>
    );
}

export function SubmitWindowHero({
    status,
    loading,
    refreshing = false,
    variant = "full",
}: Readonly<SubmitWindowHeroProps>) {
    if (loading) {
        if (variant === "compact") {
            return (
                <div className="rounded-xl border border-border bg-surface px-4 py-3">
                    <div className="flex min-h-[40px] flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Loader2 className="size-[1em] animate-spin text-primary" />
                            <span>Getting submit window status...</span>
                        </div>

                        <p className="mt-1 text-xs text-muted-foreground/80">
                            This only takes a moment.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="mb-8 flex items-center gap-4 rounded-2xl border border-border px-6 py-5">
                <Skeleton className="h-12 w-12 rounded-xl" />

                <div className="flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="mt-2 h-3 w-64" />
                </div>
            </div>
        );
    }
    if (!status) return null;

    const state = getWindowState(status);

    if (variant === "compact") {
        if (state.type === "open") {
            return (
                <div className="rounded-xl border border-success-border bg-success-surface px-4 py-3">
                    <div className="flex items-center justify-center gap-2 text-center">
                        <CalendarCheck className="size-[1.2em] text-success" />
                        <span className="text-sm font-medium text-foreground">{copy.open}</span>
                    </div>

                    <div className="mt-1 text-center text-xs text-muted-foreground">
                        {formatDateTime(state.openFrom)} - {formatDateTime(state.openTo)}
                    </div>
                </div>
            );
        }

        if (state.type === "next") {
            return (
                <div className="rounded-xl border border-info-border bg-info-surface px-4 py-3">
                    <div className="flex items-center justify-center gap-2 text-center">
                        <CalendarClock className="size-[1.2em] text-info" />
                        <span className="text-sm font-medium text-foreground">
                            {copy.next(state.opensIn)}
                        </span>
                    </div>

                    <div className="mt-1 text-center text-xs text-muted-foreground">
                        {formatDateTime(state.openFrom)} — {formatDateTime(state.openTo)}
                    </div>
                </div>
            );
        }

        return (
            <div className="rounded-xl border border-warning-border bg-warning-surface px-4 py-3">
                <div className="flex items-center justify-center gap-2 text-center">
                    <CalendarX className="size-[1.2em] text-warning" />
                    <span className="text-sm text-muted-foreground">{copy.none}</span>
                </div>

                <div className="mt-1 text-center text-xs text-muted-foreground">
                    {copy.noneStrict}
                </div>
            </div>
        );
    }

    if (state.type === "open") {
        return (
            <div
                className={cn(
                    "mb-8 flex items-center gap-4 rounded-2xl border px-6 py-5",
                    "border-success-border bg-success-surface",
                )}
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10">
                    <CalendarCheck className="size-[1.2em] text-success" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-foreground">{copy.open}</h3>

                        {refreshing && <UpdatingIndicator />}
                    </div>

                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatDateTime(state.openFrom)} - {formatDateTime(state.openTo)}
                    </p>
                </div>
            </div>
        );
    }

    if (state.type === "next") {
        return (
            <div
                className={cn(
                    "mb-8 flex items-center gap-4 rounded-2xl border px-6 py-5",
                    "border-info-border bg-info-surface",
                )}
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info/10">
                    <CalendarClock className="size-[1.2em] text-info" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-foreground">
                            {copy.next(state.opensIn)}
                        </h3>

                        {refreshing && <UpdatingIndicator />}
                    </div>

                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatDateTime(state.openFrom)} — {formatDateTime(state.openTo)}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "mb-8 flex items-center gap-4 rounded-2xl border px-6 py-5",
                "border-warning-border bg-warning-surface",
            )}
        >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/10">
                <CalendarX className="size-[1.2em] text-warning" />
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-foreground">
                        No Upcoming Submission Windows
                    </h3>

                    {refreshing && <UpdatingIndicator />}
                </div>

                <p className="mt-0.5 text-sm text-muted-foreground">{copy.noneStrict}</p>
            </div>
        </div>
    );
}
