"use client";

import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import {
    type LimitValue,
    FASCIA_LABELS,
    LIMITATION_TYPE_LABELS,
} from "@/lib/api/limit-values";

type LimitValueCardProps = {
    limitValue: LimitValue;
    onEdit: (limitValue: LimitValue) => void;
    onToggleActive: (limitValue: LimitValue) => void;
};

export function LimitValueCard({
    limitValue,
    onEdit,
    onToggleActive,
}: Readonly<LimitValueCardProps>) {
    const formattedDate = new Date(limitValue.createdAtUtc).toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "short", year: "numeric" },
    );

    const valueDisplay =
        limitValue.currencyLimit === null
            ? `${limitValue.numericalLimit?.toLocaleString("en-GB")}`
            : `£${limitValue.currencyLimit.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
                        <h3 className="truncate text-sm font-semibold text-foreground">
                            {limitValue.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {limitValue.nameOfValue}
                        </p>
                    </div>
                    <StatusBadge active={limitValue.isActive} />
                </div>

                {/* Tags row */}
                <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {LIMITATION_TYPE_LABELS[limitValue.typeOfLimitation]}
                    </span>
                    {limitValue.fascia !== null && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {FASCIA_LABELS[limitValue.fascia]}
                        </span>
                    )}
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                        {valueDisplay}
                    </span>
                </div>

                {/* Metadata */}
                <p className="mt-4 text-xs text-muted-foreground">
                    Created {formattedDate}
                    {limitValue.createdByNameSnapshot &&
                        ` by ${limitValue.createdByNameSnapshot}`}
                </p>
            </div>

            {/* Actions */}
            <div className="flex border-t border-border">
                <button
                    type="button"
                    onClick={() => onEdit(limitValue)}
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
                    onClick={() => onToggleActive(limitValue)}
                    className={cn(
                        "flex flex-1 items-center justify-center gap-2 py-2.5",
                        "text-xs font-medium transition",
                        "hover:bg-muted",
                        "rounded-br-2xl",
                        limitValue.isActive
                            ? "text-muted-foreground"
                            : "text-emerald-600",
                    )}
                >
                    {limitValue.isActive ? (
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
