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

export default function NewStdRequisitionPage() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();

    const returnTo = searchParams.get("returnTo");

    const backHref =
        returnTo && returnTo.startsWith("/standard-van-drivers") && !returnTo.startsWith("//")
            ? returnTo
            : "/standard-van-drivers";

    const {
        status: submitWindowStatus,
        loading: submitWindowStatusLoading,
        error: submitWindowStatusError,
    } = useSubmitWindowStatus();

    if (authLoading || submitWindowStatusLoading) {
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

    return (
        <PageContainer>
            <StdRequisitionShell
                mode="create"
                backHref={backHref}
                submitWindowStatus={submitWindowStatus}
                submitWindowStatusLoading={submitWindowStatusLoading}
            />
        </PageContainer>
    );
}