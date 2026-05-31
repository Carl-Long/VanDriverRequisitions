"use client";

import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { ShopFilterField } from "../../filter-fields/shop-filter-field";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";
import { VanDriverLookup } from "@/lib/api/van-drivers";
import { FeVanDriverField } from "../form-fields/fe-van-driver-field";
import { VanDriverSummaryCard } from "../details/van-driver-summary-card";

type Props = {
    readonly: boolean;
    draft: FeRequisitionDraft;
    errors: Record<string, string>;

    clearError: (field: string) => void;

    onRequisitionDateChange: (
        date: Date | null,
    ) => void;

    onVanDriverChange: (
        params: {
            id: string | null;
            label: string | null;
            summary: VanDriverLookup | null;
        },
    ) => void;

    onVanDriverNameChange: (
        value: string,
    ) => void;

    onShopChange: (
        params: {
            id: string | null;
            label: string | null;
        },
    ) => void;
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
                                value={
                                    draft.requisitionDate ??
                                    undefined
                                }
                                onChange={(date) =>
                                    onRequisitionDateChange(
                                        date ?? null,
                                    )
                                }
                            />
                        </Field>

                        <ShopFilterField
                            required
                            disabled={readonly}
                            error={errors.shopId}
                            value={draft.shopId}
                            label={draft.shopLabel}
                            onChange={(
                                value,
                                label,
                            ) => {
                                onShopChange({
                                    id: value,
                                    label,
                                });

                                clearError(
                                    "shopId",
                                );
                            }}
                        />

                        <FeVanDriverField
                            disabled={readonly}
                            error={errors.vanDriverId}
                            value={draft.vanDriverId}
                            label={draft.vanDriverLabel}
                            onChange={(params) => {
                                onVanDriverChange(params);

                                clearError(
                                    "vanDriverId",
                                );

                                clearError(
                                    "vanDriverName",
                                );
                            }}
                        />

                        <Field
                            label="Driver Name"
                            error={errors.vanDriverName}
                            required
                        >
                            <Input
                                disabled={readonly}
                                value={
                                    draft.vanDriverName ?? ""
                                }
                                state={
                                    errors.vanDriverName
                                        ? "error"
                                        : "default"
                                }
                                onChange={(e) => {
                                    onVanDriverNameChange(
                                        e.target.value,
                                    );

                                    if (
                                        e.target.value.trim()
                                    ) {
                                        clearError(
                                            "vanDriverName",
                                        );
                                    }
                                }}
                            />
                        </Field>


                    </div>
                </div>

                <VanDriverSummaryCard
                    vanDriver={
                        draft.vanDriverSummary
                    }
                />
            </div>
        </div>
    );
}