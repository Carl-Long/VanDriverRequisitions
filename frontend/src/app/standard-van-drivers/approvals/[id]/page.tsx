"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { canApproveRequisitions } from "@/features/auth/roles";
import { stdRequisitionsApi } from "@/features/std-requisitions/api/std-requisitions-api";
import { StdRequisitionShell } from "@/features/std-requisitions/form/components/std-requisition-shell";
import { StdRequisitionShellSkeleton } from "@/features/std-requisitions/form/components/std-requisition-shell-skeleton";
import type { StdRequisitionDetail } from "@/features/std-requisitions/types/std-requisition.types";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import { useRequisitionLimitRules } from "@/features/requisition-limit-rules/use-requisition-limit-rules";
import { getSafeReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";

export default function StdRequisitionApprovalDetailPage() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();

    const backHref = getSafeReturnTo(searchParams.get("returnTo"), ["/standard-van-drivers/approvals"], "/standard-van-drivers/approvals");

    const tabParam = searchParams.get("tab");
    const initialActiveTabKey = tabParam === "submission-history" ? "submission-history" : undefined;
    const { user, loading: authLoading } = useAuth();
    const { limitRules, loading: limitRulesLoading, error: limitRulesError, } = useRequisitionLimitRules();

    const [requisition, setRequisition] = useState<StdRequisitionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    const canApprove = canApproveRequisitions(user);
    const errors = [error, limitRulesError].filter((e): e is string => Boolean(e));


    useEffect(() => {
        if (authLoading || !canApprove) return;

        let cancelled = false;

        async function load() {
            try {
                setError(null);

                const result = await stdRequisitionsApi.getById(params.id);

                if (!cancelled) {
                    setRequisition(result);
                }
            } catch (err) {
                if (!cancelled) {
                    if (err instanceof ApiError && err.status === 404) {
                        setNotFound(true);
                        return;
                    }

                    setError(getApiErrorMessage(err, "Failed to load requisition."));
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
    }, [params.id, authLoading, canApprove]);


    if (authLoading) {
        return (
            <PageContainer>
                <StdRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (!canApprove) {
        return <NotFound />;
    }

    const pageLoading = loading || limitRulesLoading;

    if (pageLoading) {
        return (
            <PageContainer>
                <StdRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (notFound) {
        return <NotFound />;
    }

    if (errors.length > 0) {
        return (
            <PageContainer>
                <div className="space-y-4">
                    {errors.map((error, index) => (
                        <Alert key={`${index}-${error}`}>{error}</Alert>
                    ))}
                </div>
            </PageContainer>
        );
    }

    if (!requisition) {
        return null;
    }

    return (
        <PageContainer>
            <StdRequisitionShell
                mode="approval"
                stdRequisition={requisition}
                submitWindowStatus={null}
                limitRules={limitRules}
                submitWindowStatusLoading={false}
                initialActiveTabKey={initialActiveTabKey}
                backHref={backHref}
            />
        </PageContainer>
    );
}