"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { AppDrawer, DrawerFormActions } from "@/components/ui/drawer";
import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { mapZodErrors } from "@/features/requisitions-shared/lib/map-zod-errors";

import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdAdditionalCostForm } from "../types/std-additional-cost-form";
import { calculateStdAdditionalCostFormTotal } from "../lib/calculate-std-additional-cost-form";
import { createEmptyStdAdditionalCostForm } from "../lib/create-empty-std-additional-cost-form";
import { createStdAdditionalCostFormSchema } from "../schemas/create-std-additional-cost-form-schema";
import { StdChargeFields } from "../components/std-charge-fields";
import { StdChargeLimitSummary } from "../components/std-charge-limit-summary";
import { StdChargeTypeToggle } from "../components/std-charge-type-toggle";
import { StdTotalValueCard } from "../components/std-total-value-card";
import { CostReasonField } from "@/features/cost-reasons/cost-reason-field";

type Props = {
    open: boolean;
    title: string;
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    initialValues?: StdAdditionalCostForm;
    onClose: () => void;
    onSave: (form: StdAdditionalCostForm) => void;
};

type SubmitIntent = "close" | "add-another";

export function StdAdditionalCostDrawer({
    open,
    title,
    mileageLimitRule,
    flatChargeLimitRule,
    initialValues,
    onClose,
    onSave,
}: Readonly<Props>) {
    const [form, setForm] = useState<StdAdditionalCostForm>(
        createEmptyStdAdditionalCostForm(),
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const schema = createStdAdditionalCostFormSchema({
        mileageLimitRule,
        flatChargeLimitRule,
    });

    const isEditMode = initialValues !== undefined;

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm(initialValues ?? createEmptyStdAdditionalCostForm());
        setErrors({});
    }, [open, initialValues]);

    const totalValue = useMemo(
        () => calculateStdAdditionalCostFormTotal(form),
        [form],
    );

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

        setForm(createEmptyStdAdditionalCostForm(result.data.date));
    }

    function setChargeType(chargeType: StdAdditionalCostForm["chargeType"]) {
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

    function updateChargeFields(patch: Partial<Pick<StdAdditionalCostForm, "miles" | "ratePerMile" | "flatCharge">>) {
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
        >
            <form
                id="std-additional-cost-drawer-form"
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

                <CostReasonField
                    fascia="Std"
                    required
                    value={form.reasonId}
                    reasonCode={form.reasonCode}
                    reasonText={form.reasonText}
                    isReasonActive={form.isReasonActive}
                    error={errors.reasonId}
                    onChange={(value, reason) => {
                        setForm((prev) => ({
                            ...prev,
                            reasonId: value,
                            reasonCode: reason?.code ?? null,
                            reasonText: reason?.reason ?? null,
                            isReasonActive: true,
                        }));

                        clearError("reasonId");
                        clearError("form");
                    }}
                />

                <Field
                    label="Number of Bags"
                    required
                    error={errors.numberOfBags}
                >
                    <Input
                        type="number"
                        min={1}
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

                <StdChargeTypeToggle
                    value={form.chargeType}
                    error={errors.chargeType}
                    onChange={setChargeType}
                />

                <StdChargeFields
                    charge={form}
                    errors={{
                        miles: errors.miles,
                        ratePerMile: errors.ratePerMile,
                        flatCharge: errors.flatCharge,
                    }}
                    defaultRatePerMile={mileageLimitRule?.maxRate ?? null}
                    onChange={updateChargeFields}
                />

                <StdTotalValueCard value={totalValue} />

                <DrawerFormActions>
                    <Button type="button" tone="accent" onClick={onClose}>
                        Cancel
                    </Button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
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
                                type="submit"
                                className="min-w-[160px]"
                            >
                                <Plus className="h-4 w-4" />
                                Add & Create Another
                            </Button>
                        )}
                    </div>
                </DrawerFormActions>
            </form>
        </AppDrawer>
    );
}