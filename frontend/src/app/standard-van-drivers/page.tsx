"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Inbox, Plus } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button/button";
import { Pagination } from "@/components/ui/pagination";
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
import { buildSearchParams, filtersFromSearchParams, pageFromSearchParams, } from "@/features/std-requisitions/list/lib/url-state";
import { StdRequisitionTableSkeleton } from "@/features/std-requisitions/list/components/std-requsiiton-table-skeleton";

export default function StandardDriversPage() {
    const { user } = useAuth();
    const router = useRouter();

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = filtersFromSearchParams(searchParams);
    const page = pageFromSearchParams(searchParams);
    const debouncedReqNumber = useDebounce(filters.requisitionNumber, 400);

    const [data, setData] = useState<PagedResult<StdRequisitionSummary> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const canCreate = canCreateRequisitions(user);
    const currentUserId = user?.id;

    useEffect(() => {
        if (!canCreate || !currentUserId) {
            return;
        }

        const userId = currentUserId;

        let cancelled = false;

        async function run() {
            setLoading(true);
            setError(null);

            try {
                const result = await stdRequisitionsApi.getAll(
                    buildStdRequisitionQuery(
                        page,
                        {
                            ...filters,
                            requisitionNumber: debouncedReqNumber,
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
        canCreate,
        currentUserId,
        page,
        filters.status,
        filters.shopId,
        filters.createdBy.type,
        filters.createdBy.type === "user" ? filters.createdBy.userId : "",
        debouncedReqNumber,
    ]);

    const items = data?.items ?? [];

    function handleFiltersChange(next: StdRequisitionFilters) {
        const params = buildSearchParams(next, 1);
        router.replace(`${pathname}?${params.toString()}`);
    }

    const currentListUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;

    function getRequisitionHref(req: StdRequisitionSummary) {
        return `/standard-van-drivers/${req.id}?returnTo=${encodeURIComponent(currentListUrl)}`;
    }

    const newRequisitionHref = `/standard-van-drivers/new?returnTo=${encodeURIComponent(currentListUrl)}`;

    function resetFilters() {
        router.replace(pathname);
    }

    if (!canCreateRequisitions(user)) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <PageHeader
                title="Standard Van Drivers"
                description="View and manage STD requisitions."
            >
                <Button onClick={() => router.push(newRequisitionHref)}>
                    <Plus size={16} />
                    <span>New Requisition</span>
                </Button>
            </PageHeader>

            <StdRequisitionFiltersToolbar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={resetFilters}
            />

            {error && <Alert>{error}</Alert>}

            {loading && <StdRequisitionTableSkeleton />}

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
                        const params = buildSearchParams(filters, nextPage);
                        router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="mt-6"
                />
            )}
        </PageContainer>
    );
}