"use client";

import { Calendar, User } from "lucide-react";
import { formatDateTime } from "@/lib/format/date";
import { EmptyState } from "@/components/ui/empty-state";

type SubmissionHistoryItem = {
    id: string;
    submissionNumber: number;
    status: string;
    submittedByNameSnapshot: string;
    submittedAtUtc: string;
    reviewedByNameSnapshot: string | null;
    reviewedAtUtc: string | null;
    rejectionNotes: string | null;
};

type Props = {
    submissions: SubmissionHistoryItem[];
};

export function FeSubmissionHistoryTab({
    submissions,
}: Readonly<Props>) {
    const orderedSubmissions = [...submissions].sort(
        (a, b) =>
            b.submissionNumber -
            a.submissionNumber,
    );

    if (orderedSubmissions.length === 0) {
        return (
            <EmptyState
                title="No Submission History"
            />
        );
    }

    return (
        <div className="space-y-4">
            {orderedSubmissions.map(
                (submission) => (
                    <SubmissionCard
                        key={submission.id}
                        submission={submission}
                    />
                ),
            )}
        </div>
    );
}

type SubmissionCardProps = {
    submission: SubmissionHistoryItem;
};

function SubmissionCard({
    submission,
}: Readonly<SubmissionCardProps>) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-semibold">
                        Submission #
                        {submission.submissionNumber}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {submission.status}
                    </p>
                </div>

                <StatusBadge
                    status={submission.status}
                />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                    <div className="text-sm font-medium">
                        Submitted
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {
                            submission.submittedByNameSnapshot
                        }
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(
                            submission.submittedAtUtc,
                        )}
                    </div>
                </div>

                {submission.reviewedAtUtc && (
                    <div>
                        <div className="text-sm font-medium">
                            Reviewed
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            {
                                submission.reviewedByNameSnapshot
                            }
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDateTime(
                                submission.reviewedAtUtc,
                            )}
                        </div>
                    </div>
                )}
            </div>

            {submission.rejectionNotes && (
                <div className="mt-6 border-t border-border pt-4">
                    <div className="text-sm font-medium">
                        Rejection Reason
                    </div>

                    <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                        {
                            submission.rejectionNotes
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({
    status,
}: Readonly<{
    status: string;
}>) {
    const classes =
        status === "Approved"
            ? "bg-green-100 text-green-800"
            : status === "Rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800";

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${classes}`}
        >
            {status}
        </span>
    );
}