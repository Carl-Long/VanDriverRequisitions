"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Inbox, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";
import { feRequisitionsApi, type FeRequisitionSummary } from "@/lib/api/fe-requisitions";
import type { PagedResult } from "@/lib/types";
import type { FeRequisitionFilters } from "@/components/fe-requisitions/types";
import { buildFeRequisitionQuery } from "@/components/fe-requisitions/helpers";
import { FeRequisitionTable } from "@/components/fe-requisitions/fe-requisition-table";
import { FeRequisitionFiltersToolbar } from "@/components/fe-requisitions/fe-requisition-filters-toolbar";
import { FeRequisitionTableSkeleton } from "@/components/fe-requisitions/fe-requisition-table-skeleton";
import { getApiErrorMessage } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";
import { buildSearchParams, filtersFromSearchParams, pageFromSearchParams } from "@/components/fe-requisitions/url-state";


export default function HomeVanDriversPage() {
    const { user } = useAuth();
    const router = useRouter();

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const filters = filtersFromSearchParams(searchParams);
    const page = pageFromSearchParams(searchParams);
    const debouncedReqNumber = useDebounce(filters.requisitionNumber, 400);
    const [data, setData] = useState<PagedResult<FeRequisitionSummary> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        let cancelled = false;

        async function run() {
            setLoading(true);
            setError(null);

            try {
                const result = await feRequisitionsApi.getAll(
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
            } catch (err) {
                if (!cancelled) {
                    setError(
                        getApiErrorMessage(
                            err,
                            "Failed to load requisitions.",
                        ),
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
        filters.status,
        filters.shopId,
        filters.createdBy.type,
        filters.createdBy.type ===
            "user"
            ? filters.createdBy.userId
            : "",
        debouncedReqNumber,
    ]);

    const items = data?.items ?? [];

    function handleFiltersChange(
        next: FeRequisitionFilters,
    ) {
        const params = buildSearchParams(next, 1);
        router.replace(`${pathname}?${params.toString()}`
        );
    }

    function resetFilters() {
        router.replace(pathname);
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
                <Alert>
                    {error}
                </Alert>
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
                    onPageChange={(nextPage) => {
                        const params = buildSearchParams(filters, nextPage);
                        router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="mt-6"
                />
            )}
        </PageContainer>
    );
}