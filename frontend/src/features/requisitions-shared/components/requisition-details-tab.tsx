"use client";

import { VanDriverSummaryCard } from "@/features/van-drivers/components/van-driver-summary-card";
import type { VanDriverLookup } from "@/lib/api/van-drivers";

import type { RequisitionStatus } from "../constants/requisition-status.constants";
import { RequisitionDetailsFields } from "./requisition-details-fields";
import { RequisitionProcessingInfo } from "./requisition-processing-info";
import { RequisitionStatusPill } from "./requisition-status-pill";

type RequisitionDetailsDraft = {
    status: RequisitionStatus | null;

    requisitionDate: Date | null;

    shopId: string | null;
    shopLabel: string | null;
    isShopActive?: boolean | null;

    vanDriverId: string | null;
    vanDriverLabel: string | null;
    vanDriverSummary: VanDriverLookup | null;
    vanDriverName: string | null;

    poNumber: string | null;

    approvedByNameSnapshot: string | null;
    approvedAtUtc: string | null;

    rejectionNotes: string | null;
    rejectedByNameSnapshot: string | null;
    rejectedAtUtc: string | null;
};

type Props<TDraft extends RequisitionDetailsDraft> = {
    readonly: boolean;
    draft: TDraft;
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

export function RequisitionDetailsTab<TDraft extends RequisitionDetailsDraft>({
    readonly,
    draft,
    errors,
    clearError,
    onRequisitionDateChange,
    onVanDriverChange,
    onVanDriverNameChange,
    onShopChange,
}: Readonly<Props<TDraft>>) {
    const processingInfo = getProcessingInfo(draft);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">
                    Requisition Details
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Manage requisition information
                </p>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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
                        status={processingInfo.status}
                        statusNode={
                            processingInfo.status ? (
                                <RequisitionStatusPill
                                    status={processingInfo.status}
                                />
                            ) : null
                        }
                        processedByName={processingInfo.processedByName}
                        processedAtUtc={processingInfo.processedAtUtc}
                        poNumber={draft.poNumber}
                        rejectionNotes={draft.rejectionNotes}
                    />
                </div>

                <VanDriverSummaryCard vanDriver={draft.vanDriverSummary} />
            </div>
        </div>
    );
}

function getProcessingInfo(draft: RequisitionDetailsDraft) {
    if (draft.status === "Approved") {
        return {
            status: "Approved" as const,
            processedByName: draft.approvedByNameSnapshot,
            processedAtUtc: draft.approvedAtUtc,
        };
    }

    if (draft.status === "Rejected") {
        return {
            status: "Rejected" as const,
            processedByName: draft.rejectedByNameSnapshot,
            processedAtUtc: draft.rejectedAtUtc,
        };
    }

    return {
        status: null,
        processedByName: null,
        processedAtUtc: null,
    };
}