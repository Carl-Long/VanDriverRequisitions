"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck } from "lucide-react";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { canApproveRequisitions } from "@/features/auth/roles";
import { stdRequisitionsApi } from "@/features/std-requisitions/api/std-requisitions-api";
import { StdRequisitionTable } from "@/features/std-requisitions/list/components/std-requisition-table";
import { pageFromSearchParams } from "@/features/std-requisitions/list/lib/url-state";
import type { StdRequisitionSummary } from "@/features/std-requisitions/types/std-requisition.types";
import { useAuth } from "@/providers/auth-provider";
import { getApiErrorMessage } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";
import { StdRequisitionTableSkeleton } from "@/features/std-requisitions/list/components/std-requsiiton-table-skeleton";

export default function StdRequisitionApprovalsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();

    const page = pageFromSearchParams(searchParams);

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
    }, [page, authLoading, canApprove]);

    const items = data?.items ?? [];

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
                title="STD Approvals"
                description="Review submitted STD requisitions awaiting approval."
            />

            {error && <Alert tone="danger">{error}</Alert>}

            {loading && <StdRequisitionTableSkeleton />}

            {!loading && items.length === 0 && (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No approvals waiting"
                    description="There are no submitted requisitions awaiting approval."
                />
            )}

            {!loading && items.length > 0 && (
                <StdRequisitionTable
                    items={items}
                    getHref={(req) => `/standard-van-drivers/approvals/${req.id}`}
                    onRowClick={(req) => router.push(`/standard-van-drivers/approvals/${req.id}`)}
                />
            )}

            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={(nextPage) => {
                        const params = new URLSearchParams();
                        params.set("page", String(nextPage));

                        router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="mt-6"
                />
            )}
        </PageContainer>
    );
}