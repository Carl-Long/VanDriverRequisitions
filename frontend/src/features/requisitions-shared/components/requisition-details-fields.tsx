"use client";

import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { ShopFilterField } from "@/features/requisitions-shared/components/filter-fields/shop-filter-field";
import { VanDriverField } from "@/features/van-drivers/components/van-driver-field";
import type { VanDriverLookup } from "@/lib/api/van-drivers";

type Props = {
    readonly: boolean;
    errors: Record<string, string>;
    clearError: (field: string) => void;

    requisitionDate: Date | null;
    shopId: string | null;
    shopLabel: string | null;
    isShopActive?: boolean | null;

    vanDriverId: string | null;
    vanDriverLabel: string | null;
    vanDriverSummary: VanDriverLookup | null;
    vanDriverName: string | null;

    onRequisitionDateChange: (date: Date | null) => void;
    onShopChange: (params: { id: string | null; label: string | null }) => void;
    onVanDriverChange: (params: {
        id: string | null;
        label: string | null;
        summary: VanDriverLookup | null;
    }) => void;
    onVanDriverNameChange: (value: string) => void;
};

export function RequisitionDetailsFields({
    readonly,
    errors,
    clearError,
    requisitionDate,
    shopId,
    shopLabel,
    isShopActive,
    vanDriverId,
    vanDriverLabel,
    vanDriverSummary,
    vanDriverName,
    onRequisitionDateChange,
    onShopChange,
    onVanDriverChange,
    onVanDriverNameChange,
}: Readonly<Props>) {
    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Field label="Requisition Date" error={errors.requisitionDate} required>
                <DatePicker
                    disabled={readonly}
                    value={requisitionDate ?? undefined}
                    onChange={(date) => onRequisitionDateChange(date ?? null)}
                />
            </Field>

            <ShopFilterField
                required
                disabled={readonly}
                error={errors.shopId}
                value={shopId}
                label={shopLabel}
                isShopActive={isShopActive}
                inactiveWarningContext={readonly ? "readonly" : "editable"} onChange={(value, label) => {
                    onShopChange({ id: value, label });
                    clearError("shopId");
                }}
            />

            <VanDriverField
                disabled={readonly}
                error={errors.vanDriverId}
                value={vanDriverId}
                label={vanDriverLabel}
                selectedVanDriver={vanDriverSummary}
                inactiveWarningContext={readonly ? "readonly" : "editable"}
                onChange={(params) => {
                    onVanDriverChange(params);
                    clearError("vanDriverId");
                    clearError("vanDriverName");
                }}
            />

            <Field label="Driver Name" error={errors.vanDriverName} required>
                <Input
                    disabled={readonly}
                    value={vanDriverName ?? ""}
                    state={errors.vanDriverName ? "error" : "default"}
                    onChange={(e) => {
                        onVanDriverNameChange(e.target.value);

                        if (e.target.value.trim()) {
                            clearError("vanDriverName");
                        }
                    }}
                />
            </Field>
        </div>
    );
}