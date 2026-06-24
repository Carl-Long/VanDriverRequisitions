import type { ReactNode } from "react";

import { AuditField } from "@/components/ui/field/audit-field";
import { SummaryField } from "@/components/ui/field/summary-field";

type ProcessingStatus = "Approved" | "Rejected";

type Props = {
    status: ProcessingStatus | null;
    statusNode: ReactNode;
    processedByName: string | null;
    processedAtUtc: string | null;
    poNumber: string | null;
    rejectionNotes: string | null;
};

export function RequisitionProcessingInfo({
    status,
    statusNode,
    processedByName,
    processedAtUtc,
    poNumber,
    rejectionNotes,
}: Readonly<Props>) {
    if (!status) {
        return null;
    }

    const isApproved = status === "Approved";
    const isRejected = status === "Rejected";

    return (
        <div className="mt-8 border-t border-border pt-6">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-sm font-medium">Processing Information</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Review outcome for this requisition
                    </p>
                </div>

                {statusNode}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <AuditField
                    label={isApproved ? "Approved By" : "Rejected By"}
                    name={processedByName}
                    dateTime={processedAtUtc}
                />

                {isApproved && poNumber && (
                    <SummaryField
                        label="PO Number"
                        value={<span className="font-mono">{poNumber}</span>}
                    />
                )}

                {isRejected && (
                    <div className="md:col-span-2">
                        <SummaryField
                            label="Rejection Reason"
                            value={
                                <div className="whitespace-pre-wrap font-normal">
                                    {rejectionNotes}
                                </div>
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}