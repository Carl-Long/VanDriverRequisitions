"use client";

import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { VanDriverSummaryCard } from "../details/van-driver-summary-card";
import { ShopFilterField } from "../../filter-fields/shop-filter-field";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";
import { VanDriverLookup } from "@/lib/api/van-drivers";
import { FeVanDriverField } from "../form-fields/fe-van-driver-field";

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
        <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
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

                <Field
                    label="Driver Name"
                    error={errors.vanDriverName}
                    required
                >
                    <Input
                        disabled={readonly}
                        value={draft.vanDriverName}
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

                <ShopFilterField
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
                        clearError("shopId");
                    }}
                />
            </div>

            {draft.vanDriverSummary && (
                <div className="mt-6">
                    <VanDriverSummaryCard
                        vanDriver={
                            draft.vanDriverSummary
                        }
                    />
                </div>
            )}
        </div>
    );
}