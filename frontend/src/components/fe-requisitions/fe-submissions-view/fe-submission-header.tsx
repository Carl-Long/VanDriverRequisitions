"use client";

import { Calendar, User } from "lucide-react";
import { formatDateTime } from "@/lib/format/date";
import { FeRequisitionSubmissionDetail } from "@/lib/api/fe-requisitions";
import { SubmissionStatusPill } from "./submission-status-pill";

type Props = {
    submission: FeRequisitionSubmissionDetail;
};

export function FeSubmissionHeader({
    submission,
}: Readonly<Props>) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        Submission #{submission.submissionNumber}
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Historical submission snapshot
                    </p>
                </div>

                <SubmissionStatusPill
                    status={submission.status}
                />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div>
                    <div className="text-sm font-medium">
                        Submitted By
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {submission.submittedByName}
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
                            {submission.reviewedByName}
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
                        Rejection Notes
                    </div>

                    <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                        {submission.rejectionNotes}
                    </div>
                </div>
            )}
        </div>
    );
}