"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import {
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

import { useAuth } from "@/providers/auth-provider";

import {
    feRequisitionsApi,
    type FeRequisitionSummary,
} from "@/lib/api/fe-requisitions";

import type { PagedResult } from "@/lib/types";

import { cn } from "@/lib/utils";

import { useDebounce } from "@/hooks/use-debounce";
import { INITIAL_FILTERS, requisitionStatusConfig } from "@/components/fe-requisitions/constants";
import { FeRequisitionTable } from "@/components/fe-requisitions/fe-requisition-table";
import { FilterChip } from "@/components/fe-requisitions/filter-chip";
import { buildFeRequisitionQuery } from "@/components/fe-requisitions/helpers";
import { FeRequisitionFilterModal } from "@/components/fe-requisitions/re-requisition-filter-modal";
import { FeRequisitionFilters } from "@/components/fe-requisitions/types";


export default function HomeVanDriversPage() {
    const { user } = useAuth();

    const router = useRouter();

    // Data
    const [data, setData] =
        useState<
            PagedResult<FeRequisitionSummary> | null
        >(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [page, setPage] = useState(1);

    // Filters
    const [filters, setFilters] =
        useState<FeRequisitionFilters>(
            INITIAL_FILTERS,
        );

    const [tempFilters, setTempFilters] =
        useState<FeRequisitionFilters>(
            INITIAL_FILTERS,
        );

    const [searchInput, setSearchInput] =
        useState("");

    const debouncedSearch =
        useDebounce(searchInput, 400);

    const [filterModalOpen, setFilterModalOpen] =
        useState(false);

    // Load data
    const load = useCallback(async () => {
        setLoading(true);

        setError(null);

        try {
            const result =
                await feRequisitionsApi.getAll(
                    buildFeRequisitionQuery(
                        page,
                        filters,
                    ),
                );

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

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [filters]);

    // Debounced search
    useEffect(() => {
        const trimmed = debouncedSearch.trim();

        if (
            trimmed ===
            filters.requisitionNumber
        ) {
            return;
        }

        setFilters((prev) => ({
            ...prev,
            requisitionNumber: trimmed,
        }));
    }, [
        debouncedSearch,
        filters.requisitionNumber,
    ]);

    function handleSearch(
        e: React.SyntheticEvent<
            HTMLFormElement,
            SubmitEvent
        >,
    ) {
        e.preventDefault();

        setFilters((prev) => ({
            ...prev,
            requisitionNumber:
                searchInput.trim(),
        }));
    }

    // Modal
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

    // Active chips
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
            label: `Status: ${requisitionStatusConfig[
                filters.status
            ]?.label ?? filters.status
                }`,
            onRemove: () =>
                setFilters((prev) => ({
                    ...prev,
                    status: "",
                })),
        });
    }

    const hasFilters =
        activeChips.length > 0;

    return (
        <PageContainer>
            <PageHeader
                title="Home Van Drivers"
                description="View and manage FE requisitions for home van drivers."
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

            {/* Search + Filters */}
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
                            setSearchInput(
                                e.target.value,
                            )
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

            {/* Filter Chips */}
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
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
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
            {loading && <TableSkeleton />}

            {/* Empty */}
            {!loading &&
                data?.items.length === 0 && (
                    <EmptyState
                        title={
                            hasFilters
                                ? "No requisitions match your current filters."
                                : "No requisitions yet."
                        }
                    />
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

            {/* Filters Modal */}
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