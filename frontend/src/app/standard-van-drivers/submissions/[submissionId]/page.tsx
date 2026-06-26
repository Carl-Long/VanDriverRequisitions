"use client";

import { Printer } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

import NotFound from "@/app/not-found";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { BackLink } from "@/components/ui/navigation-back-link";
import { useStdSubmission } from "@/features/std-requisitions/std-submissions-view/use-std-submission";
import { StdSubmissionHeader } from "@/features/std-requisitions/std-submissions-view/std-submission-header";
import { StdSubmissionSnapshotSummary } from "@/features/std-requisitions/std-submissions-view/std-submission-snapshot-summary";
import { StdSubmissionBanksAndBinsTable } from "@/features/std-requisitions/std-submissions-view/std-submission-banks-and-bins-table";
import { StdRequisitionShellSkeleton } from "@/features/std-requisitions/form/components/std-requisition-shell-skeleton";
import { StdSubmissionVanPacksTable } from "@/features/std-requisitions/std-submissions-view/std-submission-van-packs-table";
import { StdSubmissionPickupsTable } from "@/features/std-requisitions/std-submissions-view/std-submission-pickups-table";
import { StdSubmissionTransfersTable } from "@/features/std-requisitions/std-submissions-view/std-submission-transfers-table";
import { StdSubmissionAdditionalCostsTable } from "@/features/std-requisitions/std-submissions-view/std-submission-additional-costs-table";
import { getSafeReturnTo } from "@/features/requisitions-shared/lib/get-safe-return-to";

export default function StdSubmissionPage() {
    const params = useParams<{ submissionId: string }>();
    const searchParams = useSearchParams();

    const { data: submission, loading, error, notFound } = useStdSubmission(params.submissionId);

    const safeReturnTo = getSafeReturnTo(searchParams.get("returnTo"), ["/standard-van-drivers"], "/standard-van-drivers");

    const cameFromApprovals = safeReturnTo.startsWith("/standard-van-drivers/approvals");

    const backToRequisitionParams = new URLSearchParams();

    backToRequisitionParams.set("tab", "submission-history");
    backToRequisitionParams.set("returnTo", safeReturnTo);

    const backToRequisitionBaseHref = cameFromApprovals
        ? `/standard-van-drivers/approvals/${submission?.requisitionId}`
        : `/standard-van-drivers/${submission?.requisitionId}`;

    const backToRequisitionHref = `${backToRequisitionBaseHref}?${backToRequisitionParams.toString()}`;

    if (loading) {
        return (
            <PageContainer>
                <StdRequisitionShellSkeleton />
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
        return null;
    }

    return (
        <PageContainer>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 print:hidden">
                    <BackLink href={backToRequisitionHref}>Back to requisition</BackLink>

                    <Button
                        type="button"
                        variant="outline"
                        tone="accent"
                        onClick={() => globalThis.print()}
                    >
                        <Printer className="size-[1em]" />
                        Print / Save PDF
                    </Button>
                </div>

                <div className="print-page">
                    <div className="space-y-6 submission-print">
                        <StdSubmissionHeader submission={submission} />

                        <StdSubmissionSnapshotSummary snapshot={submission.snapshot} />

                        <StdSubmissionBanksAndBinsTable
                            rows={submission.snapshot.collectionChargesBanksAndBins}
                        />
                        <StdSubmissionVanPacksTable
                            rows={submission.snapshot.collectionVanPacks}
                        />
                        <StdSubmissionPickupsTable
                            rows={submission.snapshot.pickups}
                        />
                        <StdSubmissionTransfersTable
                            rows={submission.snapshot.transfers}
                        />
                        <StdSubmissionAdditionalCostsTable
                            rows={submission.snapshot.additionalCosts}
                        />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}