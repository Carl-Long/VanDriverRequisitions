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
import { filtersFromSearchParams, pageFromSearchParams, buildSearchParams, } from "@/features/fe-requisitions/list/lib/url-state";
import { getApiErrorMessage } from "@/lib/api/client";

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
    const canCreate = canCreateRequisitions(user);
    const currentUserId = user?.id;

    useEffect(() => {
        if (!canCreate || !currentUserId) return;
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
                        user!.id,
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

    function handleFiltersChange(next: FeRequisitionFilters) {
        const params = buildSearchParams(next, 1);
        router.replace(`${pathname}?${params.toString()}`);
    }

    const currentListUrl = `${pathname}${searchParams.toString()
        ? `?${searchParams.toString()}`
        : ""}`;

    function getRequisitionHref(req: FeRequisitionSummary) {
        return `/home-van-drivers/${req.id}?returnTo=${encodeURIComponent(currentListUrl)}`;
    }

    const newRequisitionHref = `/home-van-drivers/new?returnTo=${encodeURIComponent(currentListUrl)}`;

    function resetFilters() {
        router.replace(pathname);
    }

    if (!canCreateRequisitions(user)) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <PageHeader title="Home Van Drivers" description="View and manage FE requisitions.">
                <Button onClick={() => router.push(newRequisitionHref)}>
                    <Plus size={16} />
                    <span>New Requisition</span>
                </Button>
            </PageHeader>

            {/* Filters */}

            <FeRequisitionFiltersToolbar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={resetFilters}
            />

            {/* Error */}

            {error && <Alert>{error}</Alert>}

            {/* Loading */}

            {loading && <FeRequisitionTableSkeleton />}

            {/* Empty */}

            {!loading && items.length === 0 && (
                <EmptyState
                    icon={Inbox}
                    title="No requisitions found"
                    description="Try adjusting your filters."
                />
            )}

            {/* Table */}

            {!loading && items.length > 0 && (
                <FeRequisitionTable
                    items={items}
                    getHref={getRequisitionHref}
                    onRowClick={(req) => router.push(getRequisitionHref(req))}
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
