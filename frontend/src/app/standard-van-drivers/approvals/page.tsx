"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck } from "lucide-react";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination/pagination";
import { canApproveRequisitions } from "@/features/auth/roles";
import { stdRequisitionsApi } from "@/features/std-requisitions/api/std-requisitions-api";
import { StdRequisitionTable } from "@/features/std-requisitions/list/components/std-requisition-table";
import { pageFromSearchParams } from "@/features/std-requisitions/list/lib/url-state";
import type { StdRequisitionSummary } from "@/features/std-requisitions/types/std-requisition.types";
import { useAuth } from "@/providers/auth-provider";
import { getApiErrorMessage } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";
import { StdRequisitionTableSkeleton } from "@/features/std-requisitions/list/components/std-requisition-table-skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { RequisitionApprovalsSearchToolbar } from "@/features/requisitions-shared/components/requisition-approvals-search-toolbar";
import { getCurrentPathWithSearch, withReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";

export default function StdRequisitionApprovalsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();

    const page = pageFromSearchParams(searchParams);
    const requisitionNumber = searchParams.get("requisitionNumber") ?? "";
    const debouncedReqNumber = useDebounce(requisitionNumber, 400);

    const [data, setData] = useState<PagedResult<StdRequisitionSummary> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const canApprove = canApproveRequisitions(user);

    useEffect(() => {
        if (authLoading || !canApprove) return;

        let cancelled = false;

        async function run() {
            setLoading(true);
            setError(null);

            try {
                const result = await stdRequisitionsApi.getAll({
                    page,
                    pageSize: 10,
                    status: "Submitted",
                    requisitionNumber: debouncedReqNumber,
                });

                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getApiErrorMessage(err, "Failed to load approvals."));
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
    }, [page, authLoading, canApprove, debouncedReqNumber]);

    const items = data?.items ?? [];
    const currentListHref = getCurrentPathWithSearch(pathname, searchParams);

    function updateSearchParams(nextRequisitionNumber: string, nextPage = 1) {
        const params = new URLSearchParams(searchParams.toString());

        if (nextRequisitionNumber.trim()) {
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

    function handleRequisitionNumberChange(value: string) {
        router.replace(updateSearchParams(value));
    }

    function resetSearch() {
        router.replace(pathname);
    }

    if (authLoading) {
        return (
            <PageContainer>
                <StdRequisitionTableSkeleton />
            </PageContainer>
        );
    }

    if (!canApprove) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <PageHeader
                title="Standard Approvals"
                description="Review submitted standard van driver requisitions awaiting approval."
            />

            <RequisitionApprovalsSearchToolbar
                requisitionNumber={requisitionNumber}
                onRequisitionNumberChange={handleRequisitionNumberChange}
                onReset={resetSearch}
            />

            {error && <Alert tone="danger">{error}</Alert>}

            {loading && <StdRequisitionTableSkeleton />}

            {!loading && items.length === 0 && (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No approvals waiting"
                    description={
                        requisitionNumber
                            ? "No submitted STD requisitions match that requisition number."
                            : "There are no submitted requisitions awaiting approval."
                    }
                />
            )}

            {!loading && items.length > 0 && (
                <StdRequisitionTable
                    items={items}
                    getHref={(req) => withReturnTo(`/standard-van-drivers/approvals/${req.id}`, currentListHref)}
                    onRowClick={(req) => router.push(withReturnTo(`/standard-van-drivers/approvals/${req.id}`, currentListHref))}
                />
            )}

            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={(nextPage) => {
                        router.push(updateSearchParams(requisitionNumber, nextPage));
                    }}
                    className="mt-6"
                />
            )}
        </PageContainer>
    );
}