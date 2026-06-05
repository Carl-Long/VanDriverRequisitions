"use client";

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
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-6">
                <h2 className="text-lg font-semibold">
                    Snapshot Summary
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Requisition details at the time of submission
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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

type SummaryFieldProps = {
    label: string;
    value: string;
};

function SummaryField({
    label,
    value,
}: Readonly<SummaryFieldProps>) {
    return (
        <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </div>

            <div className="mt-1 text-sm font-medium">
                {value}
            </div>
        </div>
    );
}