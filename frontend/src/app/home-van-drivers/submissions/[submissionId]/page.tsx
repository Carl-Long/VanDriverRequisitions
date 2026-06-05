"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";

import {
    feRequisitionsApi,
    type FeRequisitionSubmissionDetail,
} from "@/lib/api/fe-requisitions";

import {
    ApiError,
    getApiErrorMessage,
} from "@/lib/api/client";

import NotFound from "@/app/not-found";

import { FeSubmissionHeader } from "@/components/fe-requisitions/fe-submissions-view/fe-submission-header";
import { FeSubmissionSnapshotSummary } from "@/components/fe-requisitions/fe-submissions-view/fe-submission-snapshot-summary";
import { FeSubmissionGeneralTasksTable } from "@/components/fe-requisitions/fe-submissions-view/fe-submission-general-tasks-table";
import { FeSubmissionPageSkeleton } from "@/components/fe-requisitions/fe-submissions-view/fe-submission-page-skeleton";

export default function SubmissionPage() {
    const params = useParams<{ submissionId: string }>();
    const [submission, setSubmission] = useState<FeRequisitionSubmissionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setError(null);

                const result =
                    await feRequisitionsApi.getSubmission(
                        params.submissionId,
                    );

                if (!cancelled) {
                    setSubmission(result);
                }
            } catch (err) {
                if (!cancelled) {
                    if (
                        err instanceof ApiError &&
                        err.status === 404
                    ) {
                        setNotFound(true);
                        return;
                    }

                    setError(
                        getApiErrorMessage(
                            err,
                            "Failed to load submission.",
                        ),
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [params.submissionId]);

    const errors = [error].filter(
        (e): e is string => Boolean(e),
    );

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
            <div className="space-y-6">
                <FeSubmissionHeader
                    submission={submission}
                />

                <FeSubmissionSnapshotSummary
                    snapshot={submission.snapshot}
                />

                <FeSubmissionGeneralTasksTable
                    tasks={
                        submission.snapshot.generalTasks
                    }
                />
            </div>
        </PageContainer>
    );
}