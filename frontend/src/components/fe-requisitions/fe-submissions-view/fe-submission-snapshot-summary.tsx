"use client";

import { SummaryField } from "@/components/ui/field/summary-field";
import { FeRequisitionSnapshot } from "@/lib/api/fe-requisitions";
import { formatCurrencyGB } from "@/lib/format/currency";
import { formatDateGB } from "@/lib/format/date";

type Props = {
    snapshot: FeRequisitionSnapshot;
};

export function FeSubmissionSnapshotSummary({
    snapshot,
}: Readonly<Props>) {
    return (
        <div className="rounded-2xl border border-border bg-surface p-6 print-card">
            <div className="mb-6 print-section-heading">
                <h2 className="text-lg font-semibold">
                    Snapshot Summary
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Requisition details at the time of submission
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 print-summary-grid">
                <SummaryField
                    label="Requisition Number"
                    value={snapshot.requisitionNumber}
                />

                <SummaryField
                    label="Requisition Date"
                    value={
                        formatDateGB(snapshot.requisitionDate) ?? "-"
                    }
                />

                <SummaryField
                    label="Shop"
                    value={`${snapshot.shopCode} - ${snapshot.shopName}`}
                />


                <SummaryField
                    label="Subtotal"
                    value={formatCurrencyGB(snapshot.subtotal)}
                />

                <SummaryField
                    label="Van Driver"
                    value={`${snapshot.vanDriverCode} - ${snapshot.tradersName}`}
                />

                <SummaryField
                    label="Driver Name"
                    value={snapshot.vanDriverName}
                />

                <SummaryField
                    label="VAT Applicable"
                    value={
                        snapshot.isVatApplicable
                            ? "Yes"
                            : "No"
                    }
                />

            </div>
        </div>
    );
}
