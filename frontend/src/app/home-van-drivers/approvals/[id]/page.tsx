"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";
import { canApproveRequisitions } from "@/features/auth/roles";
import NotFound from "@/app/not-found";
import { feRequisitionsApi } from "@/features/fe-requisitions/api/fe-requisitions-api";
import { FeRequisitionDetail } from "@/features/fe-requisitions/types/fe-requisition.types";
import { FeRequisitionShell } from "@/features/fe-requisitions/form/components/fe-requisition-shell";
import { FeRequisitionShellSkeleton } from "@/features/fe-requisitions/form/components/fe-requisition-shell-skeleton";
import { useFeTaskTypes } from "@/features/fe-requisitions/form/hooks/use-fe-task-types";
import { useRequisitionLimitRules } from "@/features/requisition-limit-rules/use-requisition-limit-rules";
import { getSafeReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";

export default function Page() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();

    const backHref = getSafeReturnTo(searchParams.get("returnTo"), ["/home-van-drivers/approvals"], "/home-van-drivers/approvals");

    const tabParam = searchParams.get("tab");
    const initialActiveTabKey = tabParam === "submission-history" ? "submission-history" : undefined;
    const { user, loading: authLoading } = useAuth();

    const {
        limitRules,
        loading: limitRulesLoading,
        error: limitRulesError,
    } = useRequisitionLimitRules();

    const { taskTypes, loading: taskTypesLoading, error: taskTypesError } = useFeTaskTypes();

    const [requisition, setRequisition] = useState<FeRequisitionDetail | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);
    const canApprove = canApproveRequisitions(user);

    useEffect(() => {
        if (authLoading || !canApprove) return;

        let cancelled = false;

        async function load() {
            try {
                setError(null);

                const result = await feRequisitionsApi.getById(params.id);

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



    const errors = [error, limitRulesError, taskTypesError].filter((e): e is string => Boolean(e));

    if (authLoading) {
        return (
            <PageContainer>
                <FeRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (!canApprove) {
        return <NotFound />;
    }

    const pageLoading = loading || limitRulesLoading || taskTypesLoading;

    if (pageLoading) {
        return (
            <PageContainer>
                <FeRequisitionShellSkeleton />
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
            <FeRequisitionShell
                mode="approval"
                feRequisition={requisition}
                limitRules={limitRules}
                taskTypes={taskTypes}
                submitWindowStatus={null}
                submitWindowStatusLoading={false}
                initialActiveTabKey={initialActiveTabKey}
                backHref={backHref}
            />
        </PageContainer>
    );
}
