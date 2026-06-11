"use client";

import { PageContainer } from "@/components/layout/page-container";
import { useSubmitWindowStatus } from "@/features/submit-windows/hooks/use-submit-window-status";
import { Alert } from "@/components/ui/alert";
import NotFound from "@/app/not-found";
import { canCreateRequisitions } from "@/lib/auth/roles";
import { useAuth } from "@/providers/auth-provider";
import { FeRequisitionShell } from "@/features/fe-requisitions/form/components/fe-requisition-shell";
import { FeRequisitionShellSkeleton } from "@/features/fe-requisitions/form/components/fe-requisition-shell-skeleton";
import { useFeTaskTypes } from "@/features/fe-requisitions/form/hooks/use-fe-task-types";
import { useRequisitionLimitRules } from "@/features/fe-requisitions/form/hooks/use-requisition-limit-rules";

export default function NewRequisitionPage() {
    const {
        limitRules,
        loading: limitRulesLoading,
        error: limitRulesError,
    } = useRequisitionLimitRules();

    const {
        taskTypes,
        loading: taskTypesLoading,
        error: taskTypesError,
    } = useFeTaskTypes();

    const {
        status: submitStatus,
        loading: submitWindowStatusLoading,
        error: submitWindowStatusError,
    } = useSubmitWindowStatus();

    const errors = [
        limitRulesError,
        taskTypesError,
        submitWindowStatusError,
    ].filter(Boolean);

    const { user, loading: authLoading } = useAuth();

    const canCreate = canCreateRequisitions(user);

    const loading =
        authLoading ||
        limitRulesLoading ||
        taskTypesLoading ||
        submitWindowStatusLoading;

    if (loading) {
        return (
            <PageContainer>
                <FeRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (!canCreate) {
        return <NotFound />;
    }

    if (errors.length > 0) {
        return (
            <PageContainer>
                <div className="space-y-4">
                    {errors.map((error, index) => (
                        <Alert key={`${index}-${error}`}>
                            {error}
                        </Alert>
                    ))}
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <FeRequisitionShell
                mode="create"
                taskTypes={taskTypes}
                limitRules={limitRules}
                submitWindowStatus={submitStatus}
                submitWindowStatusLoading={submitWindowStatusLoading}
            />
        </PageContainer>
    );
}