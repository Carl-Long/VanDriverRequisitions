"use client";

import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";

import type { FeRequisitionFilters } from "./types";
import {
    INITIAL_FILTERS,
    REQUISITION_STATUSES,
    requisitionStatusConfig,
} from "./constants";
import { IconButton } from "../ui/button/icon-button";
import { X } from "lucide-react";

type Props = {
    open: boolean;
    filters: FeRequisitionFilters;
    onClose: () => void;
    onFiltersChange: (filters: FeRequisitionFilters) => void;
    onApply: () => void;
};

export function FeRequisitionFilterDrawer({
    open,
    filters,
    onClose,
    onFiltersChange,
    onApply,
}: Readonly<Props>) {
    function update<K extends keyof FeRequisitionFilters>(
        key: K,
        value: FeRequisitionFilters[K],
    ) {
        onFiltersChange({
            ...filters,
            [key]: value,
        });
    }

    function resetFilters() {
        onFiltersChange(INITIAL_FILTERS);
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "absolute right-0 top-0 h-full w-full max-w-md",
                    "bg-background shadow-xl",
                    "flex flex-col",
                    "animate-in slide-in-from-right",
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                        Filter Requisitions
                    </h2>

                    <IconButton
                        size="sm"
                        tone="accent"
                        variant="ghost"
                        onClick={onClose}
                        aria-label="Close filters"
                    >
                        <X size={16} />
                    </IconButton>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {/* Created By Me */}
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={filters.createdByMe}
                            onChange={(e) =>
                                update("createdByMe", e.target.checked)
                            }
                            className="h-4 w-4 rounded border-border accent-primary"
                        />

                        <span className="text-sm font-medium text-foreground">
                            Show only my requisitions
                        </span>
                    </label>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="filter-status"
                            className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                            Status
                        </label>

                        <select
                            id="filter-status"
                            value={filters.status}
                            onChange={(e) =>
                                update(
                                    "status",
                                    e.target.value as FeRequisitionFilters["status"],
                                )
                            }
                            className={cn(
                                "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm",
                                "focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring/20",
                            )}
                        >
                            <option value="">All statuses</option>

                            {REQUISITION_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {requisitionStatusConfig[status].label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border px-5 py-4 flex items-center justify-between">
                    <Button
                        tone="accent"
                        variant="outline"
                        onClick={resetFilters}
                    >
                        Reset
                    </Button>

                    <div className="flex items-center gap-3">
                        <Button
                            tone="primary"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button onClick={onApply}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}