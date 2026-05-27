"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Inbox, Plus, Search, SlidersHorizontal } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

import { useAuth } from "@/providers/auth-provider";

import {
    feRequisitionsApi,
    type FeRequisitionSummary,
} from "@/lib/api/fe-requisitions";

import type { PagedResult } from "@/lib/types";

import { useDebounce } from "@/hooks/use-debounce";

import {
    EMPTY_FILTERS,
    INITIAL_FILTERS,
    requisitionStatusConfig,
} from "@/components/fe-requisitions/constants";

import { FeRequisitionTable } from "@/components/fe-requisitions/fe-requisition-table";
import { FilterChip } from "@/components/fe-requisitions/filter-chip";
import { buildFeRequisitionQuery } from "@/components/fe-requisitions/helpers";
import { FeRequisitionFilters } from "@/components/fe-requisitions/types";
import { FeRequisitionFilterDrawer } from "@/components/fe-requisitions/fe-requisitions-filter-drawer";

type QueryState = FeRequisitionFilters;

export default function HomeVanDriversPage() {
    const { user } = useAuth();
    const router = useRouter();

    // =========================
    // Core state
    // =========================
    const [query, setQuery] = useState<QueryState>(INITIAL_FILTERS);
    const [page, setPage] = useState(1);

    // =========================
    // Data state
    // =========================
    const [data, setData] =
        useState<PagedResult<FeRequisitionSummary> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const items = data?.items ?? [];

    // =========================
    // Search state (UI only)
    // =========================
    const [searchInput, setSearchInput] = useState("");
    const debouncedSearch = useDebounce(searchInput, 400);

    // =========================
    // Filter drawer state
    // =========================
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [draftFilters, setDraftFilters] =
        useState<QueryState>(query);

    // =========================
    // Sync search → query
    // =========================
    useEffect(() => {
        setQuery(prev => ({
            ...prev,
            requisitionNumber: debouncedSearch.trim(),
        }));

        setPage(1);
    }, [debouncedSearch]);

    // =========================
    // Fetch data
    // =========================
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await feRequisitionsApi.getAll(
                    buildFeRequisitionQuery(page, query)
                );

                if (!cancelled) {
                    setData(result);
                }
            } catch {
                if (!cancelled) {
                    setError(
                        "Failed to load requisitions. Is the API running?"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [query, page]);

    // =========================
    // Drawer handlers
    // =========================
    function openFilterDrawer() {
        setDraftFilters(query);
        setFilterDrawerOpen(true);
    }

    function closeFilterDrawer() {
        setFilterDrawerOpen(false);
    }

    function applyFilters() {
        setQuery(draftFilters);
        setPage(1);
        setFilterDrawerOpen(false);
    }

    function clearAllFilters() {
        setQuery(EMPTY_FILTERS);
        setSearchInput("");
        setPage(1);
    }

    // =========================
    // Active chips
    // =========================
    const activeChips = useMemo(() => {
        const chips: {
            key: string;
            label: string;
            onRemove: () => void;
        }[] = [];

        if (query.createdByMe) {
            chips.push({
                key: "mine",
                label: `My Requisitions${user ? ` (${user.name})` : ""}`,
                onRemove: () =>
                    setQuery(prev => ({
                        ...prev,
                        createdByMe: false,
                    })),
            });
        }

        if (query.requisitionNumber) {
            chips.push({
                key: "reqNum",
                label: `Req #: ${query.requisitionNumber}`,
                onRemove: () => {
                    setQuery(prev => ({
                        ...prev,
                        requisitionNumber: "",
                    }));
                    setSearchInput("");
                },
            });
        }

        if (query.status) {
            chips.push({
                key: "status",
                label: `Status: ${requisitionStatusConfig[query.status]?.label ??
                    query.status
                    }`,
                onRemove: () =>
                    setQuery(prev => ({
                        ...prev,
                        status: "",
                    })),
            });
        }

        return chips;
    }, [query, user]);

    const hasFilters = activeChips.length > 0;

    const emptyState = useMemo(() => {
        if (!hasFilters) {
            return {
                icon: Inbox,
                title: "No requisitions yet",
                description:
                    "Requisitions will appear here once they are created.",
            };
        }

        return {
            icon: Search,
            title: "No requisitions found",
            description:
                "Try adjusting or clearing your filters to see results.",
        };
    }, [hasFilters]);

    // =========================
    // Render
    // =========================
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

            {/* Search + Filters */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-md">
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
                        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm"
                    />
                </div>

                <Button
                    tone="secondary"
                    onClick={openFilterDrawer}
                >
                    <SlidersHorizontal size={16} />
                    <span>Filters</span>
                </Button>
            </div>

            {/* Chips */}
            {hasFilters && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {activeChips.map(chip => (
                        <FilterChip
                            key={chip.key}
                            label={chip.label}
                            onRemove={chip.onRemove}
                        />
                    ))}

                    <button
                        onClick={clearAllFilters}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Count */}
            <div className="mb-4 text-sm text-muted-foreground">
                {data && !loading
                    ? `${data.totalCount} requisition${data.totalCount === 1 ? "" : "s"
                    }`
                    : "\u00A0"}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded bg-red-500/10 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && <TableSkeleton />}

            {/* Empty */}
            {!loading && items.length === 0 && (
                <EmptyState
                    icon={emptyState.icon}
                    title={emptyState.title}
                    description={emptyState.description}
                />
            )}

            {/* Table */}
            {!loading && items.length > 0 && (
                <FeRequisitionTable
                    items={items}
                    onRowClick={req =>
                        router.push(
                            `/home-van-drivers/${req.id}`
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

            {/* Filter Drawer */}
            <FeRequisitionFilterDrawer
                open={filterDrawerOpen}
                filters={draftFilters}
                onClose={closeFilterDrawer}
                onFiltersChange={setDraftFilters}
                onApply={applyFilters}
            />
        </PageContainer>
    );
}