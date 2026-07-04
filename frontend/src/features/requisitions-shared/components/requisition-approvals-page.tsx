"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination/pagination";
import { canApproveRequisitions } from "@/features/auth/roles";
import {
    getCurrentPathWithSearch,
    withReturnTo,
} from "@/features/requisitions-shared/lib/get-safe-return-to";
import { pageFromSearchParams } from "@/features/requisitions-shared/list/page-url-state";
import { getApiErrorMessage } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";

import {
    RequisitionListTable,
    type RequisitionListTableItem,
} from "./requisition-list-table";
import { RequisitionApprovalsSearchToolbar } from "./requisition-approvals-search-toolbar";
import { RequisitionTableSkeleton } from "./requisition-table-skeleton";

type ApprovalListQuery = {
    page: number;
    pageSize: number;
    status: "Submitted";
    requisitionNumber: string;
};

type Props<TItem extends RequisitionListTableItem> = {
    title: string;
    description: string;
    detailBasePath: string;
    emptySearchDescription: string;
    emptyDefaultDescription: string;
    loadApprovals: (query: ApprovalListQuery) => Promise<PagedResult<TItem>>;
};

const APPROVALS_PAGE_SIZE = 10;

export function RequisitionApprovalsPage<
    TItem extends RequisitionListTableItem,
>({
    title,
    description,
    detailBasePath,
    emptySearchDescription,
    emptyDefaultDescription,
    loadApprovals,
}: Readonly<Props<TItem>>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();

    const page = pageFromSearchParams(searchParams);
    const requisitionNumber = searchParams.get("requisitionNumber") ?? "";
    const debouncedRequisitionNumber = useDebounce(requisitionNumber, 400);

    const [data, setData] = useState<PagedResult<TItem> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const canApprove = canApproveRequisitions(user);
    const items = data?.items ?? [];
    const currentListHref = getCurrentPathWithSearch(pathname, searchParams);

    useEffect(() => {
        if (authLoading || !canApprove) {
            return;
        }

        let cancelled = false;

        async function run() {
            setLoading(true);
            setError(null);

            try {
                const result = await loadApprovals({
                    page,
                    pageSize: APPROVALS_PAGE_SIZE,
                    status: "Submitted",
                    requisitionNumber: debouncedRequisitionNumber,
                });

                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        getApiErrorMessage(
                            err,
                            "Failed to load approvals.",
                        ),
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, [
        authLoading,
        canApprove,
        debouncedRequisitionNumber,
        loadApprovals,
        page,
    ]);

    function buildApprovalsHref(
        nextRequisitionNumber: string,
        nextPage = 1,
    ) {
        const params = new URLSearchParams(searchParams.toString());
        const trimmedRequisitionNumber = nextRequisitionNumber.trim();

        if (trimmedRequisitionNumber) {
            params.set("requisitionNumber", nextRequisitionNumber);
        } else {
            params.delete("requisitionNumber");
        }

        if (nextPage > 1) {
            params.set("page", String(nextPage));
        } else {
            params.delete("page");
        }

        const queryString = params.toString();

        return queryString ? `${pathname}?${queryString}` : pathname;
    }

    function getApprovalHref(item: TItem) {
        return withReturnTo(
            `${detailBasePath}/${item.id}`,
            currentListHref,
        );
    }

    function handleRequisitionNumberChange(value: string) {
        router.replace(buildApprovalsHref(value));
    }

    function resetSearch() {
        router.replace(pathname);
    }

    if (authLoading) {
        return (
            <PageContainer>
                <RequisitionTableSkeleton />
            </PageContainer>
        );
    }

    if (!canApprove) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <PageHeader title={title} description={description} />

            <RequisitionApprovalsSearchToolbar
                requisitionNumber={requisitionNumber}
                onRequisitionNumberChange={handleRequisitionNumberChange}
                onReset={resetSearch}
            />

            {error && <Alert tone="danger">{error}</Alert>}

            {loading && <RequisitionTableSkeleton />}

            {!loading && items.length === 0 && (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No approvals waiting"
                    description={
                        requisitionNumber
                            ? emptySearchDescription
                            : emptyDefaultDescription
                    }
                />
            )}

            {!loading && items.length > 0 && (
                <RequisitionListTable
                    items={items}
                    getHref={getApprovalHref}
                    onRowClick={(item) => {
                        router.push(getApprovalHref(item));
                    }}
                />
            )}

            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={(nextPage) => {
                        router.push(
                            buildApprovalsHref(
                                requisitionNumber,
                                nextPage,
                            ),
                        );
                    }}
                    className="mt-6"
                />
            )}
        </PageContainer>
    );
}