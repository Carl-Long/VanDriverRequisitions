"use client";

import { FeRequisitionDraft } from "../types/fe-requisition-draft";
import { VanDriverLookup } from "@/lib/api/van-drivers";
import { VanDriverSummaryCard } from "../../../van-drivers/components/van-driver-summary-card";
import { RequisitionDetailsFields } from "@/features/requisitions-shared/components/requisition-details-fields";
import { RequisitionProcessingInfo } from "@/features/requisitions-shared/components/requisition-processing-info";
import { RequisitionStatusPill } from "@/features/requisitions-shared/components/requisition-status-pill";


type Props = {
    readonly: boolean;
    draft: FeRequisitionDraft;
    errors: Record<string, string>;
    clearError: (field: string) => void;
    onRequisitionDateChange: (date: Date | null) => void;
    onVanDriverChange: (params: {
        id: string | null;
        label: string | null;
        summary: VanDriverLookup | null;
    }) => void;
    onVanDriverNameChange: (value: string) => void;
    onShopChange: (params: { id: string | null; label: string | null }) => void;
};

export function FeRequisitionDetailsTab({
    readonly,
    draft,
    errors,
    clearError,
    onRequisitionDateChange,
    onVanDriverChange,
    onVanDriverNameChange,
    onShopChange,
}: Readonly<Props>) {
    const isApproved = draft.status === "Approved";
    const isRejected = draft.status === "Rejected";
    const processingStatus = isApproved ? "Approved" : isRejected ? "Rejected" : null;
    const processedByName = isApproved ? draft.approvedByNameSnapshot : draft.rejectedByNameSnapshot;
    const processedAtUtc = isApproved ? draft.approvedAtUtc : draft.rejectedAtUtc;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Requisition Details</h2>

                <p className="mt-1 text-sm text-muted-foreground">Manage requisition information</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <RequisitionDetailsFields
                        readonly={readonly}
                        errors={errors}
                        clearError={clearError}
                        requisitionDate={draft.requisitionDate}
                        shopId={draft.shopId}
                        shopLabel={draft.shopLabel}
                        isShopActive={draft.isShopActive}
                        vanDriverId={draft.vanDriverId}
                        vanDriverLabel={draft.vanDriverLabel}
                        vanDriverSummary={draft.vanDriverSummary}
                        vanDriverName={draft.vanDriverName}
                        onRequisitionDateChange={onRequisitionDateChange}
                        onShopChange={onShopChange}
                        onVanDriverChange={onVanDriverChange}
                        onVanDriverNameChange={onVanDriverNameChange}
                    />

                    <RequisitionProcessingInfo
                        status={processingStatus}
                        statusNode={processingStatus ? <RequisitionStatusPill status={processingStatus} /> : null}
                        processedByName={processedByName}
                        processedAtUtc={processedAtUtc}
                        poNumber={draft.poNumber}
                        rejectionNotes={draft.rejectionNotes}
                    />
                </div>

                <VanDriverSummaryCard vanDriver={draft.vanDriverSummary} />
            </div>
        </div>
    );
}
