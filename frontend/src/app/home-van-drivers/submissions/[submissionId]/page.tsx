"use client";

import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import NotFound from "@/app/not-found";
import { useSubmission } from "@/features/fe-requisitions/fe-submissions-view/use-submission";
import { FeSubmissionGeneralTasksTable } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-general-tasks-table";
import { FeSubmissionHeader } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-header";
import { FeSubmissionPageSkeleton } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-page-skeleton";
import { FeSubmissionSnapshotSummary } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-snapshot-summary";
import { FeSubmissionMileageTable } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-mileage-table";
import { FeSubmissionTransfersTable } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-transfers-table";
import { FeSubmissionAdditionalCostsTable } from "@/features/fe-requisitions/fe-submissions-view/fe-submission-additional-costs-table";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { BackLink } from "@/components/ui/navigation-back-link";
import { Button } from "@/components/ui/button/button";

export default function SubmissionPage() {
    const params = useParams<{ submissionId: string }>();

    const { data: submission, loading, error, notFound } = useSubmission(params.submissionId);

    const errors = [error].filter((e): e is string => Boolean(e));

    if (loading) {
        return (
            <PageContainer>
                <FeSubmissionPageSkeleton />
            </PageContainer>
        );
    }

    if (notFound) {
        return <NotFound />;
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

    if (!submission) {
        return null;
    }

    return (
        <PageContainer>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 print:hidden">
                    <BackLink href={`/home-van-drivers/${submission.requisitionId}?tab=submission-history`}>
                        Back to requisition
                    </BackLink>

                    <Button type="button" variant="outline" tone="accent" onClick={() => globalThis.print()}>
                        <Printer size={14} />
                        Print / Save PDF
                    </Button>
                </div>

                <div className="print-page">
                    <div className="space-y-6 submission-print">
                        <FeSubmissionHeader submission={submission} />
                        <FeSubmissionSnapshotSummary snapshot={submission.snapshot} />
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
