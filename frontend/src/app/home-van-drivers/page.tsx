"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Inbox, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";
import type { PagedResult } from "@/lib/types";
import type { FeRequisitionFilters } from "@/features/fe-requisitions/types/fe-requisiton-filters.types";
import { canCreateRequisitions } from "@/features/auth/roles";
import NotFound from "../not-found";
import { feRequisitionsApi } from "@/features/fe-requisitions/api/fe-requisitions-api";
import { FeRequisitionSummary } from "@/features/fe-requisitions/types/fe-requisition.types";
import { Alert } from "@/components/ui/alert";
import { FeRequisitionFiltersToolbar } from "@/features/fe-requisitions/list/components/fe-requisition-filters-toolbar";
import { FeRequisitionTable } from "@/features/fe-requisitions/list/components/fe-requisition-table";
import { FeRequisitionTableSkeleton } from "@/features/fe-requisitions/list/components/fe-requisition-table-skeleton";
import { buildFeRequisitionQuery } from "@/features/fe-requisitions/list/lib/build-fe-requisition-query";
import { filtersFromSearchParams, pageFromSearchParams, buildSearchParams, pageSizeFromSearchParams, } from "@/features/fe-requisitions/list/lib/url-state";
import { getApiErrorMessage } from "@/lib/api/client";
import { INITIAL_FILTERS } from "@/features/fe-requisitions/constants/fe-requisition-status.constants";

export default function HomeVanDriversPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const filters = filtersFromSearchParams(searchParams);
    const page = pageFromSearchParams(searchParams);
    const pageSize = pageSizeFromSearchParams(searchParams);
    const debouncedReqNumber = useDebounce(filters.requisitionNumber, 400);
    const [data, setData] = useState<PagedResult<FeRequisitionSummary> | null>(null);
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

        let cancelled = false;

        const userId = currentUserId;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const createdByFilter: FeRequisitionFilters["createdBy"] =
                    createdByType === "user"
                        ? {
                            type: "user",
                            userId: createdByUserId,
                            label: createdByLabel,
                        }
                        : {
                            type: createdByType,
                        };

                const result = await feRequisitionsApi.getAll(
                    buildFeRequisitionQuery(
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
                    setError(getApiErrorMessage(err, "Failed to load requisitions."));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

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

    function handleFiltersChange(next: FeRequisitionFilters) {
        const params = buildSearchParams(next, 1, pageSize);
        router.replace(`${pathname}?${params.toString()}`);
    }

    function handlePageSizeChange(nextPageSize: number) {
        const params = buildSearchParams(filters, 1, nextPageSize);
        router.replace(`${pathname}?${params.toString()}`);
    }

    const queryString = searchParams.toString();
    const currentListUrl = queryString ? `${pathname}?${queryString}` : pathname;

    function getRequisitionHref(req: FeRequisitionSummary) {
        return `/home-van-drivers/${req.id}?returnTo=${encodeURIComponent(currentListUrl)}`;
    }

    const newRequisitionHref = `/home-van-drivers/new?returnTo=${encodeURIComponent(currentListUrl)}`;

    function resetFilters() {
        const params = buildSearchParams(INITIAL_FILTERS, 1, pageSize);
        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    }

    if (authLoading) {
        return (
            <PageContainer>
                <FeRequisitionTableSkeleton />
            </PageContainer>
        );
    }

    if (!canCreate) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <PageHeader title="Home Van Drivers" description="View and manage home van driver requisitions.">
                <Button onClick={() => router.push(newRequisitionHref)}>
                    <Plus className="size-[1em]" />
                    <span>New Requisition</span>
                </Button>
            </PageHeader>

            <FeRequisitionFiltersToolbar
                filters={filters}
                pageSize={pageSize}
                onFiltersChange={handleFiltersChange}
                onPageSizeChange={handlePageSizeChange}
                onReset={resetFilters}
            />

            {error && <Alert>{error}</Alert>}

            {loading && <FeRequisitionTableSkeleton />}

            {!loading && items.length === 0 && (
                <EmptyState
                    icon={Inbox}
                    title="No requisitions found"
                    description="Try adjusting your filters."
                />
            )}

            {!loading && items.length > 0 && (
                <FeRequisitionTable
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
