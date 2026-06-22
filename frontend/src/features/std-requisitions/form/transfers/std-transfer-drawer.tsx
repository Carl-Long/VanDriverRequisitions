"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { AppDrawer } from "@/components/ui/drawer";
import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { mapZodErrors } from "@/features/requisitions-shared/lib/map-zod-errors";
import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdTransferForm } from "../types/std-transfer-form";
import { calculateStdTransferFormTotal } from "../lib/calculate-std-transfer-form";
import { createEmptyStdTransferForm } from "../lib/create-empty-std-transfer-form";
import { createStdTransferFormSchema } from "../schemas/create-std-transfer-form-schema";
import { ShopFilterField } from "@/features/requisitions-shared/components/filter-fields/shop-filter-field";
import { StdChargeFields } from "../components/std-charge-fields";
import { StdChargeLimitSummary } from "../components/std-charge-limit-summary";
import { StdChargeTypeToggle } from "../components/std-charge-type-toggle";
import { StdTotalValueCard } from "../components/std-total-value-card";

type Props = {
    open: boolean;
    title: string;
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    initialValues?: StdTransferForm;
    onClose: () => void;
    onSave: (form: StdTransferForm) => void;
};

type SubmitIntent = "close" | "add-another";

export function StdTransferDrawer({
    open,
    title,
    mileageLimitRule,
    flatChargeLimitRule,
    initialValues,
    onClose,
    onSave,
}: Readonly<Props>) {
    const [form, setForm] = useState<StdTransferForm>(
        createEmptyStdTransferForm(),
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const schema = createStdTransferFormSchema({
        mileageLimitRule,
        flatChargeLimitRule,
    });

    const isEditMode = initialValues !== undefined;

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm(initialValues ?? createEmptyStdTransferForm());
        setErrors({});
    }, [open, initialValues]);

    const totalValue = useMemo(() => calculateStdTransferFormTotal(form), [form]);

    function clearError(field: string) {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    function saveForm(intent: SubmitIntent) {
        const result = schema.safeParse(form);

        if (!result.success) {
            setErrors(mapZodErrors(result.error));
            return;
        }

        setErrors({});
        onSave(result.data);

        if (intent === "close") {
            onClose();
            return;
        }

        setForm(createEmptyStdTransferForm(result.data.date));
    }

    function setChargeType(chargeType: StdTransferForm["chargeType"]) {
        setForm((prev) => ({
            ...prev,
            chargeType,
            miles: chargeType === STD_CHARGE_TYPE.Mileage ? prev.miles : null,
            ratePerMile:
                chargeType === STD_CHARGE_TYPE.Mileage ? prev.ratePerMile : null,
            flatCharge:
                chargeType === STD_CHARGE_TYPE.FlatCharge ? prev.flatCharge : null,
        }));

        clearError("chargeType");
        clearError("miles");
        clearError("ratePerMile");
        clearError("flatCharge");
        clearError("form");
    }

    function updateChargeFields(patch: Partial<Pick<StdTransferForm, "miles" | "ratePerMile" | "flatCharge">>) {
        setForm((prev) => ({
            ...prev,
            ...patch,
        }));

        Object.keys(patch).forEach(clearError);
        clearError("form");
    }

    if (!open) {
        return null;
    }

    return (
        <AppDrawer
            open={open}
            title={title}
            onClose={onClose}
            footer={
                <div className="flex items-center justify-between">
                    <Button type="button" tone="accent" onClick={onClose}>
                        Cancel
                    </Button>

                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            className="min-w-[160px]"
                            variant="outline"
                            onClick={() => saveForm("close")}
                        >
                            {isEditMode ? "Update & Close" : "Add & Close"}
                        </Button>

                        {!isEditMode && (
                            <Button
                                form="std-transfer-drawer-form"
                                type="submit"
                                className="min-w-[180px]"
                            >
                                <Plus className="h-4 w-4" />
                                Add & Create Another
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <form
                id="std-transfer-drawer-form"
                noValidate
                className="space-y-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    saveForm(isEditMode ? "close" : "add-another");
                }}
            >
                <StdChargeLimitSummary
                    chargeType={form.chargeType}
                    mileageLimitRule={mileageLimitRule}
                    flatChargeLimitRule={flatChargeLimitRule}
                />

                {errors.form && <Alert tone="danger">{errors.form}</Alert>}

                <div className="space-y-4">
                    <ShopFilterField
                        required
                        fieldLabel="From Shop"
                        placeholder="Select from shop"
                        value={form.shopIdFrom}
                        label={form.shopLabelFrom}
                        error={errors.shopIdFrom}
                        onChange={(value, label) => {
                            setForm((prev) => ({
                                ...prev,
                                shopIdFrom: value,
                                shopLabelFrom: label,
                                shopCodeFrom: null,
                                shopNameFrom: null,
                            }));

                            clearError("shopIdFrom");
                            clearError("shopIdTo");
                            clearError("form");
                        }}
                    />

                    <ShopFilterField
                        required
                        fieldLabel="To Shop"
                        placeholder="Select to shop"
                        value={form.shopIdTo}
                        label={form.shopLabelTo}
                        error={errors.shopIdTo}
                        onChange={(value, label) => {
                            setForm((prev) => ({
                                ...prev,
                                shopIdTo: value,
                                shopLabelTo: label,
                                shopCodeTo: null,
                                shopNameTo: null,
                            }));

                            clearError("shopIdTo");
                            clearError("form");
                        }}
                    />
                </div>

                <Field label="Date" required error={errors.date}>
                    <DatePicker
                        value={form.date ?? undefined}
                        state={errors.date ? "error" : "default"}
                        onChange={(date) => {
                            setForm((prev) => ({
                                ...prev,
                                date: date ?? null,
                            }));

                            clearError("date");
                        }}
                    />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Number of Bags" error={errors.numberOfBags}>
                        <Input
                            type="number"
                            min={0}
                            step={1}
                            value={form.numberOfBags ?? ""}
                            state={errors.numberOfBags ? "error" : "default"}
                            onChange={(event) => {
                                const value =
                                    event.target.value === ""
                                        ? null
                                        : Number(event.target.value);

                                setForm((prev) => ({
                                    ...prev,
                                    numberOfBags: value,
                                }));

                                clearError("numberOfBags");
                            }}
                        />
                    </Field>

                    <Field label="Number of Boxes" error={errors.numberOfBoxes}>
                        <Input
                            type="number"
                            min={0}
                            step={1}
                            value={form.numberOfBoxes ?? ""}
                            state={errors.numberOfBoxes ? "error" : "default"}
                            onChange={(event) => {
                                const value =
                                    event.target.value === ""
                                        ? null
                                        : Number(event.target.value);

                                setForm((prev) => ({
                                    ...prev,
                                    numberOfBoxes: value,
                                }));

                                clearError("numberOfBoxes");
                            }}
                        />
                    </Field>
                </div>

                <StdChargeTypeToggle
                    value={form.chargeType}
                    error={errors.chargeType}
                    onChange={setChargeType}
                />

                <StdChargeFields
                    charge={form}
                    errors={{ miles: errors.miles, ratePerMile: errors.ratePerMile, flatCharge: errors.flatCharge }}
                    onChange={updateChargeFields}
                />

                <StdTotalValueCard value={totalValue} />
            </form>
        </AppDrawer>
    );
}