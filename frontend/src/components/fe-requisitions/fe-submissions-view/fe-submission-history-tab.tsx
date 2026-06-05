"use client";

import { Calendar, ChevronRight, User } from "lucide-react";
import { formatDateTime } from "@/lib/format/date";
import { EmptyState } from "@/components/ui/empty-state";
import { useRouter } from "next/navigation";
import { SubmissionStatusPill } from "./submission-status-pill";
import { SubmissionStatus } from "./submission-status";
import Link from "next/link";

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
        return (<EmptyState title="No Submission History" />);
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
        <Link
            href={`/home-van-drivers/submissions/${submission.id}`}
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

                    <SubmissionStatusPill
                        status={submission.status}
                    />
                </div>

                <div
                    className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-surface-elevated
                    "
                >
                    <ChevronRight
                        className="
                            h-4
                            w-4
                            text-muted-foreground
                            transition-transform
                            group-hover:translate-x-0.5
                        "
                    />
                </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                    <div className="text-sm font-medium">
                        Submitted By
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {submission.submittedByNameSnapshot}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(submission.submittedAtUtc)}
                    </div>
                </div>

                {submission.reviewedAtUtc && (
                    <div>
                        <div className="text-sm font-medium">
                            Reviewed
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            {submission.reviewedByNameSnapshot}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDateTime(submission.reviewedAtUtc)}
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
                        {submission.rejectionNotes}
                    </div>
                </div>
            )}
        </Link>
    );
}