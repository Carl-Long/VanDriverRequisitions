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
    subtotal: number;

    onRequisitionDateChange: (
        date: Date | undefined,
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
    subtotal,
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
                    required
                >
                    <DatePicker
                        disabled={readonly}
                        value={
                            draft.requisitionDate
                        }
                        onChange={
                            onRequisitionDateChange
                        }
                    />
                </Field>

                <FeVanDriverField
                    disabled={readonly}
                    value={draft.vanDriverId}
                    label={draft.vanDriverLabel}
                    onChange={onVanDriverChange}
                />

                <Field
                    label="Driver Name"
                    required
                >
                    <Input
                        disabled={readonly}
                        value={
                            draft.vanDriverName
                        }
                        onChange={(e) =>
                            onVanDriverNameChange(
                                e.target.value,
                            )
                        }
                    />
                </Field>

                <ShopFilterField
                    disabled={readonly}
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