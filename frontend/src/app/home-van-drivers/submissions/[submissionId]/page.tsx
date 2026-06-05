"use client";

import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import NotFound from "@/app/not-found";
import { FeSubmissionHeader } from "@/components/fe-requisitions/fe-submissions-view/fe-submission-header";
import { FeSubmissionSnapshotSummary } from "@/components/fe-requisitions/fe-submissions-view/fe-submission-snapshot-summary";
import { FeSubmissionGeneralTasksTable } from "@/components/fe-requisitions/fe-submissions-view/fe-submission-general-tasks-table";
import { FeSubmissionPageSkeleton } from "@/components/fe-requisitions/fe-submissions-view/fe-submission-page-skeleton";
import { useSubmission } from "@/hooks/use-submission";

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
                        <Alert key={`${index}-${error}`}>
                            {error}
                        </Alert>
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
            <div className="space-y-6 submission-print">
                <FeSubmissionHeader submission={submission} />
                <FeSubmissionSnapshotSummary snapshot={submission.snapshot} />
                <FeSubmissionGeneralTasksTable tasks={submission.snapshot.generalTasks} />
            </div>
        </PageContainer>
    );
}