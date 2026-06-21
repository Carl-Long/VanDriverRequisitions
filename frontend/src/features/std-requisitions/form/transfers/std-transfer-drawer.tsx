"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, Plus } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { AppDrawer } from "@/components/ui/drawer";
import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { formatCurrencyGB } from "@/lib/format/currency";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { mapZodErrors } from "@/features/requisitions-shared/lib/map-zod-errors";

import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdTransferForm } from "../types/std-transfer-form";
import { calculateStdTransferFormTotal } from "../lib/calculate-std-transfer-form";
import { createEmptyStdTransferForm } from "../lib/create-empty-std-transfer-form";
import { createStdTransferFormSchema } from "../schemas/create-std-transfer-form-schema";
import { ShopFilterField } from "@/features/requisitions-shared/components/filter-fields/shop-filter-field";

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
                <LimitSummary
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

                <Field label="Charge Type" required error={errors.chargeType}>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant={
                                form.chargeType === STD_CHARGE_TYPE.Mileage
                                    ? "solid"
                                    : "outline"
                            }
                            onClick={() => setChargeType(STD_CHARGE_TYPE.Mileage)}
                        >
                            Mileage
                        </Button>

                        <Button
                            type="button"
                            variant={
                                form.chargeType === STD_CHARGE_TYPE.FlatCharge
                                    ? "solid"
                                    : "outline"
                            }
                            onClick={() => setChargeType(STD_CHARGE_TYPE.FlatCharge)}
                        >
                            Flat charge
                        </Button>
                    </div>
                </Field>

                {form.chargeType === STD_CHARGE_TYPE.Mileage ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Miles" required error={errors.miles}>
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                value={form.miles ?? ""}
                                state={errors.miles ? "error" : "default"}
                                onChange={(event) => {
                                    const value =
                                        event.target.value === ""
                                            ? null
                                            : Number(event.target.value);

                                    setForm((prev) => ({
                                        ...prev,
                                        miles: value,
                                    }));

                                    clearError("miles");
                                    clearError("form");
                                }}
                            />
                        </Field>

                        <Field
                            label="Rate Per Mile"
                            required
                            error={errors.ratePerMile}
                        >
                            <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.ratePerMile ?? ""}
                                state={errors.ratePerMile ? "error" : "default"}
                                onChange={(event) => {
                                    const value =
                                        event.target.value === ""
                                            ? null
                                            : Number(event.target.value);

                                    setForm((prev) => ({
                                        ...prev,
                                        ratePerMile: value,
                                    }));

                                    clearError("ratePerMile");
                                    clearError("form");
                                }}
                            />
                        </Field>
                    </div>
                ) : (
                    <Field label="Flat Charge" required error={errors.flatCharge}>
                        <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.flatCharge ?? ""}
                            state={errors.flatCharge ? "error" : "default"}
                            onChange={(event) => {
                                const value =
                                    event.target.value === ""
                                        ? null
                                        : Number(event.target.value);

                                setForm((prev) => ({
                                    ...prev,
                                    flatCharge: value,
                                }));

                                clearError("flatCharge");
                                clearError("form");
                            }}
                        />
                    </Field>
                )}

                <div className="rounded-2xl border border-border bg-surface-subtle p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Value</span>

                        <span className="font-medium">
                            {formatCurrencyGB(totalValue)}
                        </span>
                    </div>
                </div>
            </form>
        </AppDrawer>
    );
}

type LimitSummaryProps = {
    chargeType: StdTransferForm["chargeType"];
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
};

function LimitSummary({
    chargeType,
    mileageLimitRule,
    flatChargeLimitRule,
}: Readonly<LimitSummaryProps>) {
    const activeRule =
        chargeType === STD_CHARGE_TYPE.Mileage
            ? mileageLimitRule
            : flatChargeLimitRule;

    return (
        <div className="flex gap-3 rounded-xl border border-border bg-surface-subtle p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

            <div className="text-sm">
                <div className="font-medium">
                    {chargeType === STD_CHARGE_TYPE.Mileage
                        ? "Mileage Limits"
                        : "Flat Charge Limits"}
                </div>

                {activeRule ? (
                    <>
                        {chargeType === STD_CHARGE_TYPE.Mileage && (
                            <div className="mt-1 text-muted-foreground">
                                Maximum miles:{" "}
                                <strong className="text-foreground">
                                    {activeRule.maxQuantity}
                                </strong>
                            </div>
                        )}

                        <div
                            className={
                                chargeType === STD_CHARGE_TYPE.Mileage
                                    ? "text-muted-foreground"
                                    : "mt-1 text-muted-foreground"
                            }
                        >
                            {chargeType === STD_CHARGE_TYPE.Mileage
                                ? "Maximum rate per mile"
                                : "Maximum flat charge"}
                            :{" "}
                            <strong className="text-foreground">
                                {formatCurrencyGB(activeRule.maxRate)}
                            </strong>
                        </div>
                    </>
                ) : (
                    <div className="mt-1 text-muted-foreground">
                        No limit rule is configured for this option.
                    </div>
                )}
            </div>
        </div>
    );
}