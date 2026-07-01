"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { ApiError, getApiErrorMessage } from "@/lib/api/client";
import { useSubmitWindowStatus } from "@/features/submit-windows/hooks/use-submit-window-status";
import { useAuth } from "@/providers/auth-provider";
import { canCreateRequisitions } from "@/features/auth/roles";
import { feRequisitionsApi } from "@/features/fe-requisitions/api/fe-requisitions-api";
import type { FeRequisitionDetail } from "@/features/fe-requisitions/types/fe-requisition.types";
import { FeRequisitionShell } from "@/features/fe-requisitions/form/components/fe-requisition-shell";
import { FeRequisitionShellSkeleton } from "@/features/fe-requisitions/form/components/fe-requisition-shell-skeleton";
import { useFeTaskTypes } from "@/features/fe-requisitions/form/hooks/use-fe-task-types";
import { useRequisitionLimitRules } from "@/features/requisition-limit-rules/use-requisition-limit-rules";
import { getSafeReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";

export default function FeRequisitionDetailPage() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    const canCreate = canCreateRequisitions(user);
    const backHref = getSafeReturnTo(searchParams.get("returnTo"), ["/home-van-drivers"], "/home-van-drivers",);
    const initialActiveTabKey = searchParams.get("tab") ?? undefined;
    const { limitRules, loading: limitRulesLoading, error: limitRulesError, } = useRequisitionLimitRules();
    const { taskTypes, loading: taskTypesLoading, error: taskTypesError, } = useFeTaskTypes();
    const { status: submitWindowStatus, loading: submitWindowStatusLoading, error: submitWindowStatusError, } = useSubmitWindowStatus();

    const [requisition, setRequisition] = useState<FeRequisitionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !canCreate || !params.id) {
            return;
        }

        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            setNotFound(false);

            try {
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
    }, [params.id, authLoading, canCreate]);

    const errors = [error, limitRulesError, taskTypesError, submitWindowStatusError].filter(
        (e): e is string => Boolean(e),
    );

    if (authLoading) {
        return (
            <PageContainer>
                <FeRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (!canCreate) {
        return <NotFound />;
    }

    if (notFound) {
        return <NotFound />;
    }

    const pageLoading =
        loading || limitRulesLoading || taskTypesLoading || submitWindowStatusLoading;

    if (pageLoading) {
        return (
            <PageContainer>
                <FeRequisitionShellSkeleton />
            </PageContainer>
        );
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
        return <NotFound />;
    }

    return (
        <PageContainer>
            <FeRequisitionShell
                mode={requisition.isEditable ? "edit" : "readonly"}
                initialActiveTabKey={initialActiveTabKey}
                backHref={backHref}
                feRequisition={requisition}
                limitRules={limitRules}
                taskTypes={taskTypes}
                submitWindowStatus={submitWindowStatus}
                submitWindowStatusLoading={submitWindowStatusLoading}
            />
        </PageContainer>
    );
}