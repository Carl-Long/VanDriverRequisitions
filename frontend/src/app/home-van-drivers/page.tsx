"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Inbox, Plus } from "lucide-react";

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
    INITIAL_FILTERS,
} from "@/components/fe-requisitions/constants";

import type {
    FeRequisitionFilters,
} from "@/components/fe-requisitions/types";

import { buildFeRequisitionQuery } from "@/components/fe-requisitions/helpers";
import { FeRequisitionTable } from "@/components/fe-requisitions/fe-requisition-table";
import { FeRequisitionFiltersToolbar } from "@/components/fe-requisitions/fe-requisition-filters-toolbar";
import { FeRequisitionTableSkeleton } from "@/components/fe-requisitions/fe-requisition-table-skeleton";


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

    // =========================
    // Pagination
    // =========================

    const [page, setPage] = useState(1);


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
                                requisitionNumber: debouncedReqNumber,
                            },
                            user!.id
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

    const items = data?.items ?? [];

    function handleFiltersChange(
        next: FeRequisitionFilters,
    ) {
        setPage(1);
        setFilters(next);
    }

    function resetFilters() {
        setPage(1);
        setFilters(INITIAL_FILTERS);
    }

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

            {/* Filters */}

            <FeRequisitionFiltersToolbar
                filters={filters}
                onFiltersChange={
                    handleFiltersChange
                }
                onReset={resetFilters}
            />

            {/* Error */}

            {error && (
                <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading */}

            {loading && <FeRequisitionTableSkeleton />}

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
            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={setPage}
                    className="mt-6"
                />
            )}
        </PageContainer>
    );
}