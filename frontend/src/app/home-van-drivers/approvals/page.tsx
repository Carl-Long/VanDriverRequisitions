"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import type { PagedResult } from "@/lib/types";
import { getApiErrorMessage } from "@/lib/api/client";
import NotFound from "@/app/not-found";
import { canApproveRequisitions } from "@/features/auth/roles";
import { useAuth } from "@/providers/auth-provider";
import { feRequisitionsApi } from "@/features/fe-requisitions/api/fe-requisitions-api";
import { FeRequisitionSummary } from "@/features/fe-requisitions/types/fe-requisition.types";
import { FeRequisitionTable } from "@/features/fe-requisitions/list/components/fe-requisition-table";
import { FeRequisitionTableSkeleton } from "@/features/fe-requisitions/list/components/fe-requisition-table-skeleton";
import { pageFromSearchParams } from "@/features/fe-requisitions/list/lib/url-state";
import { useDebounce } from "@/hooks/use-debounce";
import { RequisitionApprovalsSearchToolbar } from "@/features/requisitions-shared/components/requisition-approvals-search-toolbar";

export default function FeRequisitionApprovalsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();

    const page = pageFromSearchParams(searchParams);
    const requisitionNumber = searchParams.get("requisitionNumber") ?? "";
    const debouncedReqNumber = useDebounce(requisitionNumber, 400);

    const [data, setData] = useState<PagedResult<FeRequisitionSummary> | null>(null);

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
                const result = await feRequisitionsApi.getAll({
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
                <FeRequisitionTableSkeleton />
            </PageContainer>
        );
    }

    if (!canApprove) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <PageHeader
                title="Approvals"
                description="Review submitted FE requisitions awaiting approval."
            />

            <RequisitionApprovalsSearchToolbar
                requisitionNumber={requisitionNumber}
                onRequisitionNumberChange={handleRequisitionNumberChange}
                onReset={resetSearch}
            />

            {error && <Alert>{error}</Alert>}

            {loading && <FeRequisitionTableSkeleton />}

            {!loading && items.length === 0 && (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No approvals waiting"
                    description={
                        requisitionNumber
                            ? "No submitted requisitions match that requisition number."
                            : "There are no submitted requisitions awaiting approval."
                    }
                />
            )}

            {!loading && items.length > 0 && (
                <FeRequisitionTable
                    items={items}
                    getHref={(req) => `/home-van-drivers/approvals/${req.id}`}
                    onRowClick={(req) => router.push(`/home-van-drivers/approvals/${req.id}`)}
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
