"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Inbox, Plus } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";
import type { PagedResult } from "@/lib/types";
import { canCreateRequisitions } from "@/features/auth/roles";
import NotFound from "@/app/not-found";
import { getApiErrorMessage } from "@/lib/api/client";
import { stdRequisitionsApi } from "@/features/std-requisitions/api/std-requisitions-api";
import type { StdRequisitionSummary } from "@/features/std-requisitions/types/std-requisition.types";
import type { StdRequisitionFilters } from "@/features/std-requisitions/types/std-requisition-filters.types";
import { StdRequisitionFiltersToolbar } from "@/features/std-requisitions/list/components/std-requisition-filters-toolbar";
import { StdRequisitionTable } from "@/features/std-requisitions/list/components/std-requisition-table";

import { buildStdRequisitionQuery } from "@/features/std-requisitions/list/lib/build-std-requisition-query";
import { buildSearchParams, filtersFromSearchParams, pageFromSearchParams, pageSizeFromSearchParams, } from "@/features/std-requisitions/list/lib/url-state";
import { INITIAL_STD_REQUISITION_FILTERS } from "@/features/std-requisitions/constants/std-requisition-status.constants";
import { RequisitionTableSkeleton } from "@/features/requisitions-shared/components/requisition-table-skeleton";

export default function StandardDriversPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = filtersFromSearchParams(searchParams);
    const page = pageFromSearchParams(searchParams);
    const pageSize = pageSizeFromSearchParams(searchParams);
    const debouncedReqNumber = useDebounce(filters.requisitionNumber, 400);

    const [data, setData] = useState<PagedResult<StdRequisitionSummary> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const canCreate = canCreateRequisitions(user);

    const currentUserId = user?.id;
    const status = filters.status;
    const shopId = filters.shopId;
    const shopLabel = filters.shopLabel;
    const createdByType = filters.createdBy.type;
    const createdByUserId = filters.createdBy.type === "user" ? filters.createdBy.userId : "";
    const createdByLabel = filters.createdBy.type === "user" ? filters.createdBy.label : "";

    useEffect(() => {
        if (authLoading || !canCreate || !currentUserId) {
            return;
        }

        const userId = currentUserId;

        let cancelled = false;

        async function run() {
            setLoading(true);
            setError(null);

            try {
                const createdByFilter: StdRequisitionFilters["createdBy"] =
                    createdByType === "user"
                        ? {
                            type: "user",
                            userId: createdByUserId,
                            label: createdByLabel,
                        }
                        : {
                            type: createdByType,
                        };

                const result = await stdRequisitionsApi.getAll(
                    buildStdRequisitionQuery(
                        page,
                        pageSize,
                        {
                            requisitionNumber: debouncedReqNumber,
                            status,
                            shopId,
                            shopLabel,
                            createdBy: createdByFilter,
                        },
                        userId,
                    ),
                );

                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getApiErrorMessage(err, "Failed to load STD requisitions."));
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
        authLoading,
        canCreate,
        currentUserId,
        page,
        pageSize,
        debouncedReqNumber,
        status,
        shopId,
        shopLabel,
        createdByType,
        createdByUserId,
        createdByLabel,
    ]);

    const items = data?.items ?? [];

    function handleFiltersChange(next: StdRequisitionFilters) {
        const params = buildSearchParams(next, 1);
        router.replace(`${pathname}?${params.toString()}`);
    }

    function handlePageSizeChange(nextPageSize: number) {
        const params = buildSearchParams(filters, 1, nextPageSize);
        router.replace(`${pathname}?${params.toString()}`);
    }

    const queryString = searchParams.toString();
    const currentListUrl = queryString ? `${pathname}?${queryString}` : pathname;

    function getRequisitionHref(req: StdRequisitionSummary) {
        return `/standard-van-drivers/${req.id}?returnTo=${encodeURIComponent(currentListUrl)}`;
    }

    const newRequisitionHref = `/standard-van-drivers/new?returnTo=${encodeURIComponent(currentListUrl)}`;

    function resetFilters() {
        const params = buildSearchParams(INITIAL_STD_REQUISITION_FILTERS, 1, pageSize,);
        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    }

    if (authLoading) {
        return (
            <PageContainer>
                <RequisitionTableSkeleton />
            </PageContainer>
        );
    }

    if (!canCreate) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <PageHeader
                title="Standard Van Drivers"
                description="View and manage standard van driver requisitions."
            >
                <Button onClick={() => router.push(newRequisitionHref)}>
                    <Plus className="size-[1em]" />
                    <span>New Requisition</span>
                </Button>
            </PageHeader>

            <StdRequisitionFiltersToolbar
                filters={filters}
                pageSize={pageSize}
                onFiltersChange={handleFiltersChange}
                onPageSizeChange={handlePageSizeChange}
                onReset={resetFilters}
            />

            {error && <Alert>{error}</Alert>}

            {loading && <RequisitionTableSkeleton />}

            {!loading && items.length === 0 && (
                <EmptyState
                    icon={Inbox}
                    title="No STD requisitions found"
                    description="Try adjusting your filters."
                />
            )}

            {!loading && items.length > 0 && (
                <StdRequisitionTable
                    items={items}
                    getHref={getRequisitionHref}
                    onRowClick={(req) => router.push(getRequisitionHref(req))}
                />
            )}

            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={(nextPage) => {
                        const params = buildSearchParams(filters, nextPage, pageSize);
                        router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="mt-6"
                />
            )}
        </PageContainer>
    );
}