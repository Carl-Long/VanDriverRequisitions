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
            <div className="print-page">
                <div className="space-y-6 submission-print">
                    <FeSubmissionHeader submission={submission} />
                    <FeSubmissionSnapshotSummary snapshot={submission.snapshot} />
                    <FeSubmissionGeneralTasksTable tasks={submission.snapshot.generalTasks} />
                </div>
            </div>
        </PageContainer>
    );
}
