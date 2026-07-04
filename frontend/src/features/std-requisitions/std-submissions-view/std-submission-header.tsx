"use client";

import { AuditField } from "@/components/ui/field/audit-field";
import { SummaryField } from "@/components/ui/field/summary-field";
import type { StdRequisitionSubmissionDetail } from "../types/std-requisition-submission.types";
import { SubmissionStatusPill } from "@/features/requisitions-shared/components/submission-status-pill";

type Props = {
    submission: StdRequisitionSubmissionDetail;
};

export function StdSubmissionHeader({ submission }: Readonly<Props>) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6 print-card print-submission-header">
            <div className="flex items-start justify-between print-header-row">
                <div>
                    <h1 className="text-xl font-bold print-title">
                        Submission #{submission.submissionNumber}
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground print-subtitle">
                        Historical submission snapshot
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <SubmissionStatusPill status={submission.status} />
                </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 print-audit-grid">
                <AuditField
                    label="Submitted By"
                    name={submission.submittedByName}
                    dateTime={submission.submittedAtUtc}
                />

                {submission.reviewedAtUtc && (
                    <AuditField
                        label="Reviewed By"
                        name={submission.reviewedByName}
                        dateTime={submission.reviewedAtUtc}
                    />
                )}
            </div>

            {submission.poNumber && (
                <div className="mt-6 border-t border-border pt-4 print-notes-block">
                    <SummaryField
                        label="Purchase Order Number"
                        value={<div className="whitespace-pre-wrap">{submission.poNumber}</div>}
                    />
                </div>
            )}

            {submission.rejectionNotes && (
                <div className="mt-6 border-t border-border pt-4 print-notes-block">
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