"use client";

import { Button } from "@/components/ui/button/button";
import { Modal } from "@/components/ui/modal";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────

const REQUISITION_STATUSES = [
    "Draft",
    "Submitted",
    "Rejected",
    "Resubmitted",
    "SentToFinance",
    "Processed",
    "ReturnedFromFinance",
] as const;

const statusConfig: Record<string, { label: string }> = {
    Draft: { label: "Draft" },
    Submitted: { label: "Submitted" },
    Rejected: { label: "Rejected" },
    Resubmitted: { label: "Resubmitted" },
    SentToFinance: { label: "Sent to Finance" },
    Processed: { label: "Processed" },
    ReturnedFromFinance: { label: "Returned" },
};

// ─────────────────────────────────────────────────────────────────────────────

export type FeRequisitionFilters = {
    requisitionNumber: string;
    status: string;
    createdByMe: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
    open: boolean;
    filters: FeRequisitionFilters;
    onClose: () => void;
    onFiltersChange: (filters: FeRequisitionFilters) => void;
    onApply: () => void;
};

// ─────────────────────────────────────────────────────────────────────────────

export function FeRequisitionFilterModal({
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
        onFiltersChange({
            requisitionNumber: "",
            status: "",
            createdByMe: false,
        });
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Filter Requisitions"
        >
            <div className="space-y-5">

                {/* Created By Me */}
                <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={filters.createdByMe}
                        onChange={(e) =>
                            update(
                                "createdByMe",
                                e.target.checked,
                            )
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
                            update("status", e.target.value)
                        }
                        className={cn(
                            "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground",
                            "focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring/20",
                            "transition-colors",
                        )}
                    >
                        <option value="">
                            All statuses
                        </option>

                        {REQUISITION_STATUSES.map((status) => (
                            <option
                                key={status}
                                value={status}
                            >
                                {statusConfig[status]?.label ??
                                    status}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        Reset filters
                    </button>

                    <div className="flex items-center gap-3">
                        <Button
                            tone="secondary"
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
        </Modal>
    );
}