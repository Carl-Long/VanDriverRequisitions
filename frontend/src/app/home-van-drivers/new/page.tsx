"use client";

import { PageContainer } from "@/components/layout/page-container";
import { FeRequisitionShell } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell";
import { useRequisitionLimitRules } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-requisition-limit-rules";
import { FeRequisitionShellSkeleton } from "@/components/fe-requisitions/fe-requisition-form/components/fe-requisition-shell-skeleton";
import { useFeTaskTypes } from "@/components/fe-requisitions/fe-requisition-form/hooks/use-fe-task-types";
import { useSubmitWindowStatus } from "@/hooks/use-submit-window-status";
import { Alert } from "@/components/ui/alert";
import NotFound from "@/app/not-found";
import { isUser } from "@/lib/auth/roles";
import { useAuth } from "@/providers/auth-provider";

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

    const loading =
        limitRulesLoading ||
        taskTypesLoading ||
        submitWindowStatusLoading;

    const errors = [
        limitRulesError,
        taskTypesError,
        submitWindowStatusError,
    ].filter(Boolean);

    const { user } = useAuth();

    if (!isUser(user)) {
        return <NotFound />;
    }

    if (loading) {
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