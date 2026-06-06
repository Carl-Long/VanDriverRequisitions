"use client";

import { FeRequisitionSubmissionDetail } from "@/lib/api/fe-requisitions";
import { SubmissionStatusPill } from "./submission-status-pill";
import { AuditField } from "@/components/ui/field/audit-field";
import { SummaryField } from "@/components/ui/field/summary-field";

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
                <AuditField
                    label="Submitted By"
                    name={submission.submittedByName}
                    dateTime={submission.submittedAtUtc}
                />

                {submission.reviewedAtUtc && (
                    <div className="space-y-4">
                        <AuditField
                            label="Reviewed By"
                            name={submission.reviewedByName}
                            dateTime={submission.reviewedAtUtc}
                        />
                    </div>
                )}
            </div>

            {submission.poNumber && (
                <div className="mt-6 border-t border-border pt-4">
                    <SummaryField
                        label="Purchase Order Number"
                        value={
                            <div className="whitespace-pre-wrap">
                                {submission.poNumber}
                            </div>
                        }
                    />
                </div>
            )}

            {submission.rejectionNotes && (
                <div className="mt-6 border-t border-border pt-4">
                    <SummaryField
                        label="Rejection Notes"
                        value={
                            <div className="whitespace-pre-wrap font-normal">
                                {submission.rejectionNotes}
                            </div>
                        }
                    />
                </div>
            )}
        </div>
    );
}