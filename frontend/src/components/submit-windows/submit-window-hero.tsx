"use client";

import { CalendarClock, CalendarCheck, CalendarPlus, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubmitWindowStatus } from "@/lib/api/submit-windows";

type SubmitWindowHeroProps = {
    status: SubmitWindowStatus | null;
    loading: boolean;
    onCreateClick: () => void;
};

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function timeUntil(iso: string): string {
    const diff = new Date(iso).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "soon";
}

export function SubmitWindowHero({
    status,
    loading,
    onCreateClick,
}: Readonly<SubmitWindowHeroProps>) {
    if (loading) {
        return (
            <div className="mb-8 h-28 animate-pulse rounded-2xl border border-border bg-surface" />
        );
    }

    if (!status) return null;

    // Currently inside an active window
    if (status.currentWindow) {
        return (
            <div
                className={cn(
                    "mb-8 flex items-center gap-4 rounded-2xl border px-6 py-5",
                    "border-emerald-500/30 bg-emerald-500/5",
                )}
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <CalendarCheck size={24} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                            Submit Window is Open
                        </h3>
                        <Lock size={14} className="text-muted-foreground" />
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatDateTime(status.currentWindow.openFrom)} —{" "}
                        {formatDateTime(status.currentWindow.openTo)}
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">
                        Submissions are currently being accepted. This window cannot be edited while active.
                    </p>
                </div>
            </div>
        );
    }

    // Upcoming window exists
    if (status.nextWindow) {
        return (
            <div
                className={cn(
                    "mb-8 flex items-center gap-4 rounded-2xl border px-6 py-5",
                    "border-blue-500/30 bg-blue-500/5",
                )}
            >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                    <CalendarClock size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">
                        Next Window Opens in {timeUntil(status.nextWindow.openFrom)}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {formatDateTime(status.nextWindow.openFrom)} —{" "}
                        {formatDateTime(status.nextWindow.openTo)}
                    </p>
                </div>
            </div>
        );
    }

    // No active or upcoming window
    return (
        <div
            className={cn(
                "mb-8 flex items-center gap-4 rounded-2xl border px-6 py-5",
                "border-amber-500/30 bg-amber-500/5",
            )}
        >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <CalendarPlus size={24} className="text-amber-600" />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                    No Upcoming Submit Windows
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                    Drivers cannot submit requisitions without an open window.
                </p>
            </div>
            <button
                type="button"
                onClick={onCreateClick}
                className={cn(
                    "shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white",
                    "transition hover:bg-amber-700",
                )}
            >
                Create Window
            </button>
        </div>
    );
}
