"use client";

import { Printer } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button/button";
import { BackLink } from "@/components/ui/navigation-back-link";
import { Alert } from "@/components/ui/alert";
import { canViewRequisitionSubmissions } from "@/features/auth/roles";
import { FeSubmissionAdditionalCostsTable } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-additional-costs-table";
import { FeSubmissionGeneralTasksTable } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-general-tasks-table";
import { FeSubmissionMileageTable } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-mileage-table";
import { FeSubmissionTransfersTable } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-transfers-table";
import { useSubmission } from "@/features/fe-requisitions/fe-submissions-view/use-submission";
import { getSafeReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";
import { useAuth } from "@/providers/auth-provider";
import { SubmissionHeader } from "@/features/requisitions-shared/components/submission-header";
import { SubmissionSnapshotSummary } from "@/features/requisitions-shared/components/submission-snapshot-summary";
import { SubmissionPageSkeleton } from "@/features/requisitions-shared/components/submission-page-skeleton";

export default function FeSubmissionPage() {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <PageContainer>
                <SubmissionPageSkeleton />
            </PageContainer>
        );
    }

    if (!canViewRequisitionSubmissions(user)) {
        return <NotFound />;
    }

    return <FeSubmissionContent />;
}

function FeSubmissionContent() {
    const params = useParams<{ submissionId: string }>();
    const searchParams = useSearchParams();

    const {
        data: submission,
        loading,
        error,
        notFound,
    } = useSubmission(params.submissionId);

    const safeReturnTo = getSafeReturnTo(
        searchParams.get("returnTo"),
        ["/home-van-drivers"],
        "/home-van-drivers",
    );

    const cameFromApprovals = safeReturnTo.startsWith("/home-van-drivers/approvals");

    const backToRequisitionParams = new URLSearchParams();

    backToRequisitionParams.set("tab", "submission-history");
    backToRequisitionParams.set("returnTo", safeReturnTo);

    const backToRequisitionBaseHref = cameFromApprovals
        ? `/home-van-drivers/approvals/${submission?.requisitionId}`
        : `/home-van-drivers/${submission?.requisitionId}`;

    const backToRequisitionHref = `${backToRequisitionBaseHref}?${backToRequisitionParams.toString()}`;

    if (loading) {
        return (
            <PageContainer>
                <SubmissionPageSkeleton />
            </PageContainer>
        );
    }

    if (notFound) {
        return <NotFound />;
    }

    if (error) {
        return (
            <PageContainer>
                <Alert tone="danger">{error}</Alert>
            </PageContainer>
        );
    }

    if (!submission) {
        return <NotFound />;
    }

    return (
        <PageContainer>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 print:hidden">
                    <BackLink href={backToRequisitionHref}>
                        Back to requisition
                    </BackLink>

                    <Button
                        type="button"
                        variant="solid"
                        tone="accent"
                        onClick={() => globalThis.print()}
                    >
                        <Printer className="size-[1em]" />
                        Print / Save PDF
                    </Button>
                </div>

                <div className="print-page">
                    <div className="space-y-6 submission-print">
                        <SubmissionHeader submission={submission} />
                        <SubmissionSnapshotSummary snapshot={submission.snapshot} />
                        <FeSubmissionGeneralTasksTable tasks={submission.snapshot.generalTasks} />
                        <FeSubmissionMileageTable rows={submission.snapshot.mileages} />
                        <FeSubmissionTransfersTable transfers={submission.snapshot.transfers} />
                        <FeSubmissionAdditionalCostsTable rows={submission.snapshot.additionalCosts} />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}