"use client";

import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import type { FeReason } from "@/lib/api/fe-reasons";

type ReasonCardProps = {
    reason: FeReason;
    onEdit: (reason: FeReason) => void;
    onToggleActive: (reason: FeReason) => void;
};

export function ReasonCard({
    reason,
    onEdit,
    onToggleActive,
}: Readonly<ReasonCardProps>) {
    const formattedDate = new Date(reason.createdAtUtc).toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "short", year: "numeric" },
    );

    return (
        <div
            className={cn(
                "flex flex-col rounded-2xl border border-border bg-surface",
                "card-shadow-interactive transition-all duration-300",
                "hover:-translate-y-0.5 hover:border-primary/20",
            )}
        >
            <div className="flex flex-1 flex-col p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                            {reason.reason}
                        </h3>
                    </div>
                    <StatusBadge active={reason.isActive} />
                </div>

                {/* Metadata */}
                <p className="mt-4 text-xs text-muted-foreground">
                    Created {formattedDate}
                    {reason.createdByNameSnapshot &&
                        ` by ${reason.createdByNameSnapshot}`}
                </p>
            </div>

            {/* Actions */}
            <div className="flex border-t border-border">
                <button
                    type="button"
                    onClick={() => onEdit(reason)}
                    className={cn(
                        "flex flex-1 items-center justify-center gap-2 py-2.5",
                        "text-xs font-medium text-foreground transition",
                        "hover:bg-muted",
                        "rounded-bl-2xl border-r border-border",
                    )}
                >
                    <Pencil size={14} />
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => onToggleActive(reason)}
                    className={cn(
                        "flex flex-1 items-center justify-center gap-2 py-2.5",
                        "text-xs font-medium transition",
                        "hover:bg-muted",
                        "rounded-br-2xl",
                        reason.isActive
                            ? "text-muted-foreground"
                            : "text-emerald-600",
                    )}
                >
                    {reason.isActive ? (
                        <>
                            <ToggleRight size={14} />
                            Deactivate
                        </>
                    ) : (
                        <>
                            <ToggleLeft size={14} />
                            Activate
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
