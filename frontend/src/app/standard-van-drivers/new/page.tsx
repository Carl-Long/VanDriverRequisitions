"use client";

import { useSearchParams } from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { canCreateRequisitions } from "@/features/auth/roles";
import { StdRequisitionShell } from "@/features/std-requisitions/form/components/std-requisition-shell";
import { StdRequisitionShellSkeleton } from "@/features/std-requisitions/form/components/std-requisition-shell-skeleton";
import { useAuth } from "@/providers/auth-provider";
import { useSubmitWindowStatus } from "@/features/submit-windows/hooks/use-submit-window-status";
import { useRequisitionLimitRules } from "@/features/requisition-limit-rules/use-requisition-limit-rules";
import { getSafeReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";

export default function NewStdRequisitionPage() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();

    const backHref = getSafeReturnTo(searchParams.get("returnTo"), ["/standard-van-drivers"], "/standard-van-drivers");

    const { status: submitWindowStatus, loading: submitWindowStatusLoading, error: submitWindowStatusError, } = useSubmitWindowStatus();
    const { limitRules, loading: limitRulesLoading, error: limitRulesError, } = useRequisitionLimitRules();
    const errors = [limitRulesError, submitWindowStatusError].filter((e): e is string => Boolean(e));

    const pageLoading = authLoading || limitRulesLoading || submitWindowStatusLoading;

    if (pageLoading) {
        return (
            <PageContainer>
                <StdRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (!canCreateRequisitions(user)) {
        return <NotFound />;
    }

    if (submitWindowStatusError) {
        return (
            <PageContainer>
                <Alert tone="danger">{submitWindowStatusError}</Alert>
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