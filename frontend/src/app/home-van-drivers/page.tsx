"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination";

import { useAuth } from "@/providers/auth-provider";

import {
    feRequisitionsApi,
    type FeRequisitionSummary,
    type FeRequisitionQuery,
} from "@/lib/api/fe-requisitions";

import type { PagedResult } from "@/lib/types";

import { cn } from "@/lib/utils";
import { FeRequisitionTable } from "@/components/fe-requisitions/fe-requisition-table";
import { FeRequisitionFilters, FeRequisitionFilterModal } from "@/components/fe-requisitions/re-requisition-filter-modal";

// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: FeRequisitionFilters = {
    requisitionNumber: "",
    status: "",
    createdByMe: true,
};

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

type FilterChipProps = {
    label: string;
    onRemove: () => void;
};

function FilterChip({
    label,
    onRemove,
}: Readonly<FilterChipProps>) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
            {label}

            <button
                type="button"
                onClick={onRemove}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={`Remove filter: ${label}`}
            >
                <X size={12} />
            </button>
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeVanDriversPage() {
    const { user } = useAuth();

    const router = useRouter();

    // Data
    const [data, setData] =
        useState<PagedResult<FeRequisitionSummary> | null>(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);

    // Filters
    const [filters, setFilters] =
        useState<FeRequisitionFilters>(DEFAULT_FILTERS);

    const [tempFilters, setTempFilters] =
        useState<FeRequisitionFilters>(DEFAULT_FILTERS);

    const [searchInput, setSearchInput] = useState("");

    const [filterModalOpen, setFilterModalOpen] =
        useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // Load
    // ─────────────────────────────────────────────────────────────────────────

    const load = useCallback(async () => {
        setLoading(true);

        setError(null);

        try {
            const query: FeRequisitionQuery = {
                page,
                pageSize: PAGE_SIZE,
                createdByMe: filters.createdByMe,
            };

            if (filters.requisitionNumber) {
                query.requisitionNumber =
                    filters.requisitionNumber;
            }

            if (filters.status) {
                query.status = filters.status;
            }

            const result =
                await feRequisitionsApi.getAll(query);

            setData(result);
        } catch {
            setError(
                "Failed to load requisitions. Is the API running?",
            );
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [filters]);

    // ─────────────────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        const trimmed = searchInput.trim();

        if (trimmed === filters.requisitionNumber) {
            return;
        }

        const timer = setTimeout(() => {
            setFilters((prev) => ({
                ...prev,
                requisitionNumber: trimmed,
            }));
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput, filters.requisitionNumber]);

    function handleSearch(
        e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
    ) {
        e.preventDefault();

        setFilters((prev) => ({
            ...prev,
            requisitionNumber: searchInput.trim(),
        }));
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Filter Modal
    // ─────────────────────────────────────────────────────────────────────────

    function openFilterModal() {
        setTempFilters(filters);

        setFilterModalOpen(true);
    }

    function closeFilterModal() {
        setFilterModalOpen(false);
    }

    function applyFilters() {
        setFilters(tempFilters);

        setFilterModalOpen(false);
    }

    function clearAllFilters() {
        setFilters({
            requisitionNumber: "",
            status: "",
            createdByMe: false,
        });

        setSearchInput("");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Active Filter Chips
    // ─────────────────────────────────────────────────────────────────────────

    const activeChips: {
        key: string;
        label: string;
        onRemove: () => void;
    }[] = [];

    if (filters.createdByMe) {
        activeChips.push({
            key: "mine",
            label: `My Requisitions${user ? ` (${user.name})` : ""
                }`,
            onRemove: () =>
                setFilters((prev) => ({
                    ...prev,
                    createdByMe: false,
                })),
        });
    }

    if (filters.requisitionNumber) {
        activeChips.push({
            key: "reqNum",
            label: `Req #: ${filters.requisitionNumber}`,
            onRemove: () => {
                setFilters((prev) => ({
                    ...prev,
                    requisitionNumber: "",
                }));

                setSearchInput("");
            },
        });
    }

    if (filters.status) {
        activeChips.push({
            key: "status",
            label: `Status: ${statusConfig[filters.status]?.label ??
                filters.status
                }`,
            onRemove: () =>
                setFilters((prev) => ({
                    ...prev,
                    status: "",
                })),
        });
    }

    const hasFilters = activeChips.length > 0;

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <PageContainer>
            <PageHeader
                title="Home Van Drivers"
                description="View and manage FE requisitions for home van drivers."
            >
                <Button
                    onClick={() =>
                        router.push("/home-van-drivers/new")
                    }
                >
                    <Plus size={16} />

                    <span>New Requisition</span>
                </Button>
            </PageHeader>

            {/* Search & Filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <form
                    onSubmit={handleSearch}
                    className="relative flex-1"
                >
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                        type="text"
                        placeholder="Search by requisition number…"
                        value={searchInput}
                        onChange={(e) =>
                            setSearchInput(e.target.value)
                        }
                        className={cn(
                            "w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground",
                            "placeholder:text-muted-foreground",
                            "focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring/20",
                            "transition-colors",
                        )}
                    />
                </form>

                <Button
                    tone="secondary"
                    onClick={openFilterModal}
                >
                    <SlidersHorizontal size={16} />

                    <span>Filters</span>
                </Button>
            </div>

            {/* Active Filters */}
            {hasFilters && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {activeChips.map((chip) => (
                        <FilterChip
                            key={chip.key}
                            label={chip.label}
                            onRemove={chip.onRemove}
                        />
                    ))}

                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Count */}
            <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                    {data && !loading
                        ? `${data.totalCount} requisition${data.totalCount === 1
                            ? ""
                            : "s"
                        }`
                        : "\u00A0"}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="overflow-hidden rounded-xl border border-border">
                    {["a", "b", "c", "d", "e"].map((key) => (
                        <div
                            key={`skeleton-${key}`}
                            className="h-14 animate-pulse border-b border-border bg-surface last:border-b-0"
                        />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading &&
                data?.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-sm text-muted-foreground">
                            {hasFilters
                                ? "No requisitions match your current filters."
                                : "No requisitions yet."}
                        </p>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearAllFilters}
                                className="mt-2 text-sm font-medium text-primary transition hover:underline"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}

            {/* Table */}
            {!loading &&
                data &&
                data.items.length > 0 && (
                    <FeRequisitionTable
                        items={data.items}
                        onRowClick={(req) =>
                            router.push(
                                `/home-van-drivers/${req.id}`,
                            )
                        }
                    />
                )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={setPage}
                    className="mt-6"
                />
            )}

            {/* Filter Modal */}
            <FeRequisitionFilterModal
                open={filterModalOpen}
                filters={tempFilters}
                onClose={closeFilterModal}
                onFiltersChange={setTempFilters}
                onApply={applyFilters}
            />
        </PageContainer>
    );
}