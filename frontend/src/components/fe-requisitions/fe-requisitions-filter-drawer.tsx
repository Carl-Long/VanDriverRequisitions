"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";

import { cn } from "@/lib/utils";

import type { FeRequisitionFilters } from "./types";

import {
    EMPTY_FILTERS,
} from "./constants";

import { StatusFilterField } from "./filter-fields/status-filter-field";
import { ShopFilterField } from "./filter-fields/shop-filter-field";

type Props = {
    open: boolean;

    filters: FeRequisitionFilters;

    onClose: () => void;

    onFiltersChange: (
        filters: FeRequisitionFilters,
    ) => void;

    onApply: () => void;
};

export function FeRequisitionFilterDrawer({
    open,
    filters,
    onClose,
    onFiltersChange,
    onApply,
}: Readonly<Props>) {
    function resetFilters() {
        onFiltersChange(EMPTY_FILTERS);
    }

    if (!open) {
        return null;
    }

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
                        Filters
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
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                    {/* Mine */}
                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={filters.createdByMe}
                            onChange={(e) =>
                                onFiltersChange({
                                    ...filters,

                                    createdByMe:
                                        e.target.checked,

                                    // clear explicit user if toggled
                                    createdByUserId:
                                        e.target.checked
                                            ? null
                                            : filters.createdByUserId,

                                    createdByUserLabel:
                                        e.target.checked
                                            ? null
                                            : filters.createdByUserLabel,
                                })
                            }
                            className="h-4 w-4 rounded border-border accent-primary"
                        />

                        <span className="text-sm font-medium text-foreground">
                            Show only my requisitions
                        </span>
                    </label>

                    {/* Status */}
                    <StatusFilterField
                        value={filters.status}
                        onChange={(value) =>
                            onFiltersChange({
                                ...filters,
                                status: value,
                            })
                        }
                    />

                    {/* Shop */}
                    <ShopFilterField
                        value={filters.shopId}
                        label={filters.shopLabel}
                        onChange={(value, label) =>
                            onFiltersChange({
                                ...filters,
                                shopId: value,
                                shopLabel: label,
                            })
                        }
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border px-5 py-4">
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