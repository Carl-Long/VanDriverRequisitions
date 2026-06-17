"use client";

import { SubmissionStatusPill } from "./submission-status-pill";
import { AuditField } from "@/components/ui/field/audit-field";
import { SummaryField } from "@/components/ui/field/summary-field";
import { Button } from "@/components/ui/button/button";
import { Printer } from "lucide-react";
import { FeRequisitionSubmissionDetail } from "@/features/fe-requisitions/types/fe-requisition-submission.types";

type Props = { submission: FeRequisitionSubmissionDetail };

export function FeSubmissionHeader({ submission }: Readonly<Props>) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6 print-card">
            <div className="flex items-start justify-between print-header-row">
                <div>
                    <h1 className="text-xl font-bold">Submission #{submission.submissionNumber}</h1>

                    <p className="mt-2 text-sm text-muted-foreground">
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
