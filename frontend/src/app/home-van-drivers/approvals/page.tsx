"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";

import {
    feRequisitionsApi,
    type FeRequisitionSummary,
} from "@/lib/api/fe-requisitions";

import type { PagedResult } from "@/lib/types";
import { getApiErrorMessage } from "@/lib/api/client";

import { FeRequisitionTable } from "@/components/fe-requisitions/fe-requisition-table";
import { FeRequisitionTableSkeleton } from "@/components/fe-requisitions/fe-requisition-table-skeleton";
import { pageFromSearchParams } from "@/components/fe-requisitions/url-state";
import NotFound from "@/app/not-found";
import { isApprover } from "@/lib/auth/roles";
import { useAuth } from "@/providers/auth-provider";

export default function FeRequisitionApprovalsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const page = pageFromSearchParams(searchParams);

    const [data, setData] =
        useState<PagedResult<FeRequisitionSummary> | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            setLoading(true);
            setError(null);

            try {
                const result = await feRequisitionsApi.getAll({
                    page,
                    pageSize: 10,
                    status: "Submitted",
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

        run();

        return () => {
            cancelled = true;
        };
    }, [page]);

    const items = data?.items ?? [];

    if (!isApprover(user)) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <PageHeader
                title="Approvals"
                description="Review submitted FE requisitions awaiting approval."
            />

            {error && (
                <Alert>
                    {error}
                </Alert>
            )}

            {loading && <FeRequisitionTableSkeleton />}

            {!loading && items.length === 0 && (
                <EmptyState
                    icon={ClipboardCheck}
                    title="No approvals waiting"
                    description="There are no submitted requisitions awaiting approval."
                />
            )}

            {!loading && items.length > 0 && (
                <FeRequisitionTable
                    items={items}
                    onRowClick={(req) =>
                        router.push(
                            `/home-van-drivers/approvals/${req.id}`,
                        )
                    }
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