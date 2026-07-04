"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { AuditField } from "@/components/ui/field/audit-field";
import { SubmissionStatusPill } from "@/features/requisitions-shared/components/submission-status-pill";
import type { SubmissionStatus } from "@/features/requisitions-shared/constants/submission-status.constants";

type SubmissionHistoryItem = {
    id: string;
    submissionNumber: number;
    status: SubmissionStatus;
    submittedByNameSnapshot: string;
    submittedAtUtc: string;
    reviewedByNameSnapshot: string | null;
    reviewedAtUtc: string | null;
    rejectionNotes: string | null;
};

type Props<TSubmission extends SubmissionHistoryItem> = {
    submissions: TSubmission[];
    submissionBasePath: string;
    returnTo?: string;
};

export function SubmissionHistoryTab<TSubmission extends SubmissionHistoryItem>({
    submissions,
    submissionBasePath,
    returnTo,
}: Readonly<Props<TSubmission>>) {
    const orderedSubmissions = [...submissions].sort(
        (a, b) => b.submissionNumber - a.submissionNumber,
    );

    if (orderedSubmissions.length === 0) {
        return <EmptyState title="No Submission History" />;
    }

    return (
        <div className="space-y-4">
            {orderedSubmissions.map((submission) => (
                <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    submissionBasePath={submissionBasePath}
                    returnTo={returnTo}
                />
            ))}
        </div>
    );
}

type SubmissionCardProps = {
    submission: SubmissionHistoryItem;
    submissionBasePath: string;
    returnTo?: string;
};

function getSubmissionHref(
    submissionBasePath: string,
    submissionId: string,
    returnTo?: string,
) {
    const params = new URLSearchParams();

    if (returnTo) {
        params.set("returnTo", returnTo);
    }

    const query = params.toString();

    return `${submissionBasePath}/${submissionId}${query ? `?${query}` : ""}`;
}

function SubmissionCard({
    submission,
    submissionBasePath,
    returnTo,
}: Readonly<SubmissionCardProps>) {
    return (
        <Link
            href={getSubmissionHref(submissionBasePath, submission.id, returnTo)}
            className="
                group
                block
                rounded-2xl
                border
                border-border
                bg-surface
                p-6
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-accent-border
                hover:bg-surface-elevated
                hover:shadow-md
            "
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold">
                        Submission #{submission.submissionNumber}
                    </h3>

                    <SubmissionStatusPill status={submission.status} />
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated">
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <AuditField
                    label="Submitted By"
                    name={submission.submittedByNameSnapshot}
                    dateTime={submission.submittedAtUtc}
                />

                {submission.reviewedAtUtc && (
                    <AuditField
                        label="Reviewed By"
                        name={submission.reviewedByNameSnapshot}
                        dateTime={submission.reviewedAtUtc}
                    />
                )}
            </div>

            {submission.rejectionNotes && (
                <div className="mt-6 border-t border-border pt-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Rejection Reason
                    </div>

                    <div className="mt-2 whitespace-pre-wrap text-sm font-medium">
                        {submission.rejectionNotes}
                    </div>
                </div>
            )}
        </Link>
    );
}