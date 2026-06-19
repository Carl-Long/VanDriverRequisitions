"use client";

import { useSearchParams } from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { canCreateRequisitions } from "@/features/auth/roles";
import { StdRequisitionShell } from "@/features/std-requisitions/form/components/std-requisition-shell";
import { StdRequisitionShellSkeleton } from "@/features/std-requisitions/form/components/std-requisition-shell-skeleton";
import { useAuth } from "@/providers/auth-provider";

export default function NewStdRequisitionPage() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();

    const returnTo = searchParams.get("returnTo");

    const backHref =
        returnTo && returnTo.startsWith("/standard-van-drivers") && !returnTo.startsWith("//")
            ? returnTo
            : "/standard-van-drivers";

    if (authLoading) {
        return (
            <PageContainer>
                <StdRequisitionShellSkeleton />
            </PageContainer>
        );
    }

    if (!canCreateRequisitions(user)) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <StdRequisitionShell mode="create" backHref={backHref} />
        </PageContainer>
    );
}