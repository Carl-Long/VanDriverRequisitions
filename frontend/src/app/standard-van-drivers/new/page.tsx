"use client";

import { useSearchParams } from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { canCreateRequisitions } from "@/features/auth/roles";
import { useRequisitionLimitRules } from "@/features/requisition-limit-rules/use-requisition-limit-rules";
import { getSafeReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";
import { StdRequisitionShell } from "@/features/std-requisitions/form/components/std-requisition-shell";
import { useSubmitWindowStatus } from "@/features/submit-windows/hooks/use-submit-window-status";
import { useAuth } from "@/providers/auth-provider";
import { RequisitionShellSkeleton } from "@/features/requisitions-shared/components/requisition-shell-skeleton";

export default function NewStdRequisitionPage() {
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

    return <NewStdRequisitionContent />;
}

function NewStdRequisitionContent() {
    const searchParams = useSearchParams();

    const backHref = getSafeReturnTo(
        searchParams.get("returnTo"),
        ["/standard-van-drivers"],
        "/standard-van-drivers",
    );

    const {
        limitRules,
        loading: limitRulesLoading,
        error: limitRulesError,
    } = useRequisitionLimitRules();

    const {
        status: submitWindowStatus,
        loading: submitWindowStatusLoading,
        error: submitWindowStatusError,
    } = useSubmitWindowStatus();

    const errors = [limitRulesError, submitWindowStatusError].filter(
        (error): error is string => Boolean(error),
    );

    const pageLoading = limitRulesLoading || submitWindowStatusLoading;

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
            <StdRequisitionShell
                mode="create"
                backHref={backHref}
                limitRules={limitRules}
                submitWindowStatus={submitWindowStatus}
                submitWindowStatusLoading={submitWindowStatusLoading}
            />
        </PageContainer>
    );
}