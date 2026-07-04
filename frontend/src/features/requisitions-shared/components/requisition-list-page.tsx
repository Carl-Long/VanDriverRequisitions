"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, Plus } from "lucide-react";
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination/pagination";
import { canCreateRequisitions } from "@/features/auth/roles";
import { INITIAL_REQUISITION_LIST_FILTERS } from "@/features/requisitions-shared/constants/requisition-list.constants";
import {
    getCurrentPathWithSearch,
    withReturnTo,
} from "@/features/requisitions-shared/lib/get-safe-return-to";
import { buildRequisitionListQuery } from "@/features/requisitions-shared/list/build-requisition-list-query";
import {
    buildSearchParams,
    filtersFromSearchParams,
    pageFromSearchParams,
    pageSizeFromSearchParams,
} from "@/features/requisitions-shared/list/requisition-list-url-state";
import type { RequisitionListFilters } from "@/features/requisitions-shared/types/requisition-list-filters.types";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api/client";
import type { RequisitionFascia } from "@/lib/constants/fascias";
import type { PagedResult } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";

import { RequisitionFiltersToolbar } from "./requisition-filters-toolbar";
import {
    RequisitionListTable,
    type RequisitionListTableItem,
} from "./requisition-list-table";
import { RequisitionTableSkeleton } from "./requisition-table-skeleton";

type Props<TItem extends RequisitionListTableItem> = {
    title: string;
    description: string;
    fascia: RequisitionFascia;
    detailBasePath: string;
    newRequisitionPath: string;
    emptyTitle: string;
    emptyDescription: string;
    loadRequisitions: (
        query: ReturnType<typeof buildRequisitionListQuery>,
    ) => Promise<PagedResult<TItem>>;
    loadErrorMessage: string;
};

export function RequisitionListPage<TItem extends RequisitionListTableItem>({
    title,
    description,
    fascia,
    detailBasePath,
    newRequisitionPath,
    emptyTitle,
    emptyDescription,
    loadRequisitions,
    loadErrorMessage,
}: Readonly<Props<TItem>>) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const searchParamsString = searchParams.toString();

    const { filters, page, pageSize } = useMemo(() => {
        const params = new URLSearchParams(searchParamsString);

        return {
            filters: filtersFromSearchParams(params),
            page: pageFromSearchParams(params),
            pageSize: pageSizeFromSearchParams(params),
        };
    }, [searchParamsString]);

    const debouncedReqNumber = useDebounce(filters.requisitionNumber, 400);

    const [data, setData] = useState<PagedResult<TItem> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const canCreate = canCreateRequisitions(user);
    const currentUserId = user?.id;
    const currentListHref = getCurrentPathWithSearch(pathname, searchParams);

    const status = filters.status;
    const shopId = filters.shopId;
    const shopLabel = filters.shopLabel;
    const createdByType = filters.createdBy.type;
    const createdByUserId =
        filters.createdBy.type === "user" ? filters.createdBy.userId : "";
    const createdByLabel =
        filters.createdBy.type === "user" ? filters.createdBy.label : "";

    const queryFilters = useMemo<RequisitionListFilters>(
        () => ({
            requisitionNumber: debouncedReqNumber,
            status,
            shopId,
            shopLabel,
            createdBy:
                createdByType === "user"
                    ? {
                          type: "user",
                          userId: createdByUserId,
                          label: createdByLabel,
                      }
                    : {
                          type: createdByType,
                      },
        }),
        [
            debouncedReqNumber,
            status,
            shopId,
            shopLabel,
            createdByType,
            createdByUserId,
            createdByLabel,
        ],
    );

    useEffect(() => {
        if (authLoading || !canCreate || !currentUserId) {
            return;
        }

        const userId = currentUserId;
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const result = await loadRequisitions(
                    buildRequisitionListQuery(
                        page,
                        pageSize,
                        queryFilters,
                        userId,
                    ),
                );

                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getApiErrorMessage(err, loadErrorMessage));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [
        authLoading,
        canCreate,
        currentUserId,
        loadErrorMessage,
        loadRequisitions,
        page,
        pageSize,
        queryFilters,
    ]);

    const items = data?.items ?? [];

    function replaceWithParams(params: URLSearchParams) {
        const queryString = params.toString();

        router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    }

    function pushWithParams(params: URLSearchParams) {
        const queryString = params.toString();

        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }

    function handleFiltersChange(next: RequisitionListFilters) {
        replaceWithParams(buildSearchParams(next, 1, pageSize));
    }

    function handlePageSizeChange(nextPageSize: number) {
        replaceWithParams(buildSearchParams(filters, 1, nextPageSize));
    }

    function resetFilters() {
        replaceWithParams(
            buildSearchParams(
                INITIAL_REQUISITION_LIST_FILTERS,
                1,
                pageSize,
            ),
        );
    }

    function getRequisitionHref(item: TItem) {
        return withReturnTo(`${detailBasePath}/${item.id}`, currentListHref);
    }

    const newRequisitionHref = withReturnTo(
        newRequisitionPath,
        currentListHref,
    );

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
            <PageHeader title={title} description={description}>
                <Button onClick={() => router.push(newRequisitionHref)}>
                    <Plus className="size-[1em]" />
                    <span>New Requisition</span>
                </Button>
            </PageHeader>

            <RequisitionFiltersToolbar
                filters={filters}
                pageSize={pageSize}
                fascia={fascia}
                onFiltersChange={handleFiltersChange}
                onPageSizeChange={handlePageSizeChange}
                onReset={resetFilters}
            />

            {error && <Alert>{error}</Alert>}

            {loading && <RequisitionTableSkeleton />}

            {!loading && items.length === 0 && (
                <EmptyState
                    icon={Inbox}
                    title={emptyTitle}
                    description={emptyDescription}
                />
            )}

            {!loading && items.length > 0 && (
                <RequisitionListTable
                    items={items}
                    getHref={getRequisitionHref}
                    onRowClick={(item) => {
                        router.push(getRequisitionHref(item));
                    }}
                />
            )}

            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={(nextPage) => {
                        pushWithParams(
                            buildSearchParams(filters, nextPage, pageSize),
                        );
                    }}
                    className="mt-6"
                />
            )}
        </PageContainer>
    );
}