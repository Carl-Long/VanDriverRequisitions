"use client";

import { useSearchParams } from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { canCreateRequisitions } from "@/features/auth/roles";
import { FeRequisitionShell } from "@/features/fe-requisitions/form/components/fe-requisition-shell";
import { useFeTaskTypes } from "@/features/fe-requisitions/form/hooks/use-fe-task-types";
import { useRequisitionLimitRules } from "@/features/requisition-limit-rules/use-requisition-limit-rules";
import { getSafeReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";
import { useSubmitWindowStatus } from "@/features/submit-windows/hooks/use-submit-window-status";
import { useAuth } from "@/providers/auth-provider";
import { RequisitionShellSkeleton } from "@/features/requisitions-shared/components/requisition-shell-skeleton";

export default function NewFeRequisitionPage() {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <PageContainer>
                <RequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (!canCreateRequisitions(user)) {
        return <NotFound />;
    }

    return <NewFeRequisitionContent />;
}

function NewFeRequisitionContent() {
    const searchParams = useSearchParams();

    const backHref = getSafeReturnTo(
        searchParams.get("returnTo"),
        ["/home-van-drivers"],
        "/home-van-drivers",
    );

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
        status: submitWindowStatus,
        loading: submitWindowStatusLoading,
        error: submitWindowStatusError,
    } = useSubmitWindowStatus();

    const errors = [limitRulesError, taskTypesError, submitWindowStatusError].filter(
        (error): error is string => Boolean(error),
    );

    const pageLoading = limitRulesLoading || taskTypesLoading || submitWindowStatusLoading;

    if (pageLoading) {
        return (
            <PageContainer>
                <RequisitionShellSkeleton />
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

    return (
        <PageContainer>
            <FeRequisitionShell
                mode="create"
                backHref={backHref}
                taskTypes={taskTypes}
                limitRules={limitRules}
                submitWindowStatus={submitWindowStatus}
                submitWindowStatusLoading={submitWindowStatusLoading}
            />
        </PageContainer>
    );
}