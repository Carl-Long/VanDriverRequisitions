"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Inbox,
    Plus,
    Search,
    SlidersHorizontal,
} from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";

import {
    feRequisitionsApi,
    type FeRequisitionSummary,
} from "@/lib/api/fe-requisitions";

import type { PagedResult } from "@/lib/types";

import {
    EMPTY_FILTERS,
    INITIAL_FILTERS,
    RequisitionStatus,
    requisitionStatusConfig,
} from "@/components/fe-requisitions/constants";

import type {
    FeRequisitionFilters,
} from "@/components/fe-requisitions/types";

import { buildFeRequisitionQuery } from "@/components/fe-requisitions/helpers";

import { FeRequisitionTable } from "@/components/fe-requisitions/fe-requisition-table";

import { FilterChip } from "@/components/fe-requisitions/filter-chip";
import { FeRequisitionFilterDrawer } from "@/components/fe-requisitions/fe-requisitions-filter-drawer";


export default function HomeVanDriversPage() {
    const router = useRouter();
    const { user } = useAuth();

    // =========================
    // Filter state
    // =========================

    const [filters, setFilters] =
        useState<FeRequisitionFilters>(
            INITIAL_FILTERS,
        );

    const [draftFilters, setDraftFilters] =
        useState<FeRequisitionFilters>(
            INITIAL_FILTERS,
        );

    // =========================
    // Pagination
    // =========================

    const [page, setPage] = useState(1);

    // =========================
    // Drawer
    // =========================

    const [drawerOpen, setDrawerOpen] =
        useState(false);

    // =========================
    // Debounced requisition search
    // =========================

    const debouncedReqNumber =
        useDebounce(
            filters.requisitionNumber,
            400,
        );

    // =========================
    // Data state
    // =========================

    const [data, setData] =
        useState<
            PagedResult<FeRequisitionSummary> | null
        >(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    // =========================
    // Fetch
    // =========================

    useEffect(() => {
        let cancelled = false;

        async function run() {
            setLoading(true);
            setError(null);

            try {
                const result =
                    await feRequisitionsApi.getAll(
                        buildFeRequisitionQuery(
                            page,
                            {
                                ...filters,
                                requisitionNumber:
                                    debouncedReqNumber,
                            },
                        ),
                    );

                if (!cancelled) {
                    setData(result);
                }
            } catch {
                if (!cancelled) {
                    setError(
                        "Failed to load requisitions.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [
        page,
        filters,
        debouncedReqNumber,
    ]);

    // =========================
    // Drawer handlers
    // =========================

    function openDrawer() {
        setDraftFilters(filters);
        setDrawerOpen(true);
    }

    function closeDrawer() {
        setDrawerOpen(false);
    }

    function applyDrawerFilters() {
        setFilters(draftFilters);
        setPage(1);
        setDrawerOpen(false);
    }

    // =========================
    // Active chips
    // =========================

    const chips = useMemo(() => {
        const result: {
            key: string;
            label: string;
            onRemove: () => void;
        }[] = [];

        if (filters.requisitionNumber) {
            result.push({
                key: "req",
                label: `Req #: ${filters.requisitionNumber}`,
                onRemove: () =>
                    setFilters((prev) => ({
                        ...prev,
                        requisitionNumber: "",
                    })),
            });
        }

        if (filters.status) {
            result.push({
                key: "status",
                label: `Status: ${requisitionStatusConfig[
                    filters.status
                ].label
                    }`,
                onRemove: () =>
                    setFilters((prev) => ({
                        ...prev,
                        status: "",
                    })),
            });
        }

        if (filters.createdByMe) {
            result.push({
                key: "mine",
                label: `My requisitions`,
                onRemove: () =>
                    setFilters((prev) => ({
                        ...prev,
                        createdByMe: false,
                    })),
            });
        }

        if (
            filters.createdByUserId &&
            filters.createdByUserLabel
        ) {
            result.push({
                key: "createdByUser",
                label: `Created By: ${filters.createdByUserLabel}`,
                onRemove: () =>
                    setFilters((prev) => ({
                        ...prev,
                        createdByUserId: null,
                        createdByUserLabel: null,
                    })),
            });
        }

        if (filters.shopId && filters.shopLabel) {
            result.push({
                key: "shop",
                label: `Shop: ${filters.shopLabel}`,
                onRemove: () =>
                    setFilters((prev) => ({
                        ...prev,
                        shopId: null,
                        shopLabel: null,
                    })),
            });
        }

        return result;
    }, [filters]);

    const hasFilters = chips.length > 0;

    const items = data?.items ?? [];

    // =========================
    // Render
    // =========================

    return (
        <PageContainer>
            <PageHeader
                title="Home Van Drivers"
                description="View and manage FE requisitions."
            >
                <Button
                    onClick={() =>
                        router.push(
                            "/home-van-drivers/new",
                        )
                    }
                >
                    <Plus size={16} />
                    <span>
                        New Requisition
                    </span>
                </Button>
            </PageHeader>

            {/* Toolbar */}

            <div className="mb-4 flex items-center gap-3">
                <div className="relative w-full max-w-md">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                        value={
                            filters.requisitionNumber
                        }
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                requisitionNumber:
                                    e.target.value,
                            }))
                        }
                        placeholder="Search requisition number..."
                        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm"
                    />
                </div>

                <Button
                    tone="secondary"
                    onClick={openDrawer}
                >
                    <SlidersHorizontal size={16} />
                    <span>Filters</span>
                </Button>
            </div>

            {/* Chips */}

            {hasFilters && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                        <FilterChip
                            key={chip.key}
                            label={chip.label}
                            onRemove={
                                chip.onRemove
                            }
                        />
                    ))}

                    <button
                        onClick={() =>
                            setFilters(
                                EMPTY_FILTERS,
                            )
                        }
                        className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Error */}

            {error && (
                <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading */}

            {loading && <TableSkeleton />}

            {/* Empty */}

            {!loading &&
                items.length === 0 && (
                    <EmptyState
                        icon={Inbox}
                        title="No requisitions found"
                        description="Try adjusting your filters."
                    />
                )}

            {/* Table */}

            {!loading &&
                items.length > 0 && (
                    <FeRequisitionTable
                        items={items}
                        onRowClick={(req) =>
                            router.push(
                                `/home-van-drivers/${req.id}`,
                            )
                        }
                    />
                )}

            {/* Pagination */}

            {data &&
                data.totalPages > 1 && (
                    <Pagination
                        page={data.page}
                        totalPages={
                            data.totalPages
                        }
                        onPageChange={
                            setPage
                        }
                        className="mt-6"
                    />
                )}

            {/* Drawer */}

            <FeRequisitionFilterDrawer
                open={drawerOpen}
                filters={draftFilters}
                onClose={closeDrawer}
                onFiltersChange={
                    setDraftFilters
                }
                onApply={
                    applyDrawerFilters
                }
            />
        </PageContainer>
    );
}