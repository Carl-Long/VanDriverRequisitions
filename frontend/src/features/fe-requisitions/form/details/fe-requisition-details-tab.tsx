"use client";

import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";
import { VanDriverLookup } from "@/lib/api/van-drivers";
import { FeVanDriverField } from "../form-fields/fe-van-driver-field";
import { VanDriverSummaryCard } from "../details/van-driver-summary-card";
import { AuditField } from "@/components/ui/field/audit-field";
import { SummaryField } from "@/components/ui/field/summary-field";

import { Alert } from "@/components/ui/alert";
import { StatusPill } from "../../list/components/status-pill";
import { ShopFilterField } from "../../list/filter-fields/shop-filter-field";

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
    onShopChange: (params: {
        id: string | null;
        label: string | null;
    }) => void;
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
    const showProcessingInfo = isApproved || isRejected;

    const processedByName = isApproved
        ? draft.approvedByNameSnapshot
        : draft.rejectedByNameSnapshot;

    const processedAtUtc = isApproved
        ? draft.approvedAtUtc
        : draft.rejectedAtUtc;

    const processingStatus = isApproved
        ? "Approved"
        : isRejected
            ? "Rejected"
            : null;

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

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
                <div className="rounded-2xl border border-border bg-surface p-6">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <Field
                            label="Requisition Date"
                            error={errors.requisitionDate}
                            required
                        >
                            <DatePicker
                                disabled={readonly}
                                value={draft.requisitionDate ?? undefined}
                                onChange={(date) =>
                                    onRequisitionDateChange(date ?? null)
                                }
                            />
                        </Field>

                        <div className="space-y-2">
                            <ShopFilterField
                                required
                                disabled={readonly}
                                error={errors.shopId}
                                value={draft.shopId}
                                label={draft.shopLabel}
                                onChange={(value, label) => {
                                    onShopChange({ id: value, label });
                                    clearError("shopId");
                                }}
                            />

                            {!readonly && draft.isShopActive === false && (
                                <Alert tone="warning">
                                    This shop is inactive. If changed, it cannot be selected again.
                                </Alert>
                            )}
                        </div>

                        <div className="space-y-2">
                            <FeVanDriverField
                                disabled={readonly}
                                error={errors.vanDriverId}
                                value={draft.vanDriverId}
                                label={draft.vanDriverLabel}
                                onChange={(params) => {
                                    onVanDriverChange(params);
                                    clearError("vanDriverId");
                                    clearError("vanDriverName");
                                }}
                            />


                            {!readonly && draft.vanDriverSummary?.isActive === false && (
                                <Alert tone="warning">
                                    This van driver is inactive. If changed, they cannot be selected again.
                                </Alert>
                            )}
                        </div>

                        <Field
                            label="Driver Name"
                            error={errors.vanDriverName}
                            required
                        >
                            <Input
                                disabled={readonly}
                                value={draft.vanDriverName ?? ""}
                                state={
                                    errors.vanDriverName
                                        ? "error"
                                        : "default"
                                }
                                onChange={(e) => {
                                    onVanDriverNameChange(e.target.value);

                                    if (e.target.value.trim()) {
                                        clearError("vanDriverName");
                                    }
                                }}
                            />
                        </Field>
                    </div>

                    {showProcessingInfo && (
                        <div className="mt-8 border-t border-border pt-6">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-medium">
                                        Processing Information
                                    </h3>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Review outcome for this requisition
                                    </p>
                                </div>

                                {processingStatus && (
                                    <StatusPill
                                        status={processingStatus}
                                    />
                                )}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <AuditField
                                    label={
                                        isApproved
                                            ? "Approved By"
                                            : "Rejected By"
                                    }
                                    name={processedByName}
                                    dateTime={processedAtUtc}
                                />

                                {isApproved && draft.poNumber && (
                                    <SummaryField
                                        label="PO Number"
                                        value={
                                            <span className="font-mono">
                                                {draft.poNumber}
                                            </span>
                                        }
                                    />
                                )}

                                {isRejected && (
                                    <div className="md:col-span-2">
                                        <SummaryField
                                            label="Rejection Reason"
                                            value={
                                                <div className="whitespace-pre-wrap font-normal">
                                                    {draft.rejectionNotes}
                                                </div>
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <VanDriverSummaryCard
                    vanDriver={draft.vanDriverSummary}
                />
            </div>
        </div>
    );
}