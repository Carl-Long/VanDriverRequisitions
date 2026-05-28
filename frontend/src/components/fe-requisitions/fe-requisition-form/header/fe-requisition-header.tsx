import { FeRequisitionActions } from "./fe-requisition-actions";

import { FeRequisitionSummaryMetrics } from "./fe-requisition-summary-metrics";

type Props = {
    requisitionNumber?: string;
    subtotal: number;
    generalTaskCount: number;
};

export function FeRequisitionHeader({
    requisitionNumber,

    subtotal,

    generalTaskCount,
}: Readonly<Props>) {
    return (
        <div
            className="
                sticky top-0 z-30
                rounded-2xl border border-border
                bg-surface/95 backdrop-blur
                p-4 shadow-sm
            "
        >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">
                            {requisitionNumber ??
                                "New Requisition"}
                        </h1>

                        <StatusBadge />
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                        FE requisition
                    </div>
                </div>

                <FeRequisitionSummaryMetrics
                    subtotal={subtotal}
                    generalTaskCount={
                        generalTaskCount
                    }
                />

                <FeRequisitionActions />
            </div>
        </div>
    );
}

function StatusBadge() {
    return (
        <div
            className="
                rounded-full
                border border-amber-200
                bg-amber-50
                px-3 py-1
                text-xs font-medium
                text-amber-700
            "
        >
            Draft
        </div>
    );
}