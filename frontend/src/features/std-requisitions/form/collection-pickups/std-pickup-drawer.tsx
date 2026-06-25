"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { AppDrawer } from "@/components/ui/drawer";
import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { mapZodErrors } from "@/features/requisitions-shared/lib/map-zod-errors";
import { StdChargeFields } from "../components/std-charge-fields";
import { StdChargeLimitSummary } from "../components/std-charge-limit-summary";
import { StdChargeTypeToggle } from "../components/std-charge-type-toggle";
import { StdTotalValueCard } from "../components/std-total-value-card";
import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdPickupForm } from "../types/std-pickup-form";
import { calculateStdPickupFormTotal } from "../lib/calculate-std-pickup-form";
import { createEmptyStdPickupForm } from "../lib/create-empty-std-pickup-form";
import { createStdPickupFormSchema } from "../schemas/create-std-pickup-form-schema";
import { RequisitionDrawerFormActions } from "@/features/requisitions-shared/components/requisition-drawer-form-actions";
import { focusFirstFormControl } from "@/features/requisitions-shared/lib/focus-first-form-control";

type Props = {
    open: boolean;
    title: string;
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    initialValues?: StdPickupForm;
    onClose: () => void;
    onSave: (form: StdPickupForm) => void;
};

type SubmitIntent = "close" | "add-another";

export function StdPickupDrawer({
    open,
    title,
    mileageLimitRule,
    flatChargeLimitRule,
    initialValues,
    onClose,
    onSave,
}: Readonly<Props>) {
    const [form, setForm] = useState<StdPickupForm>(createEmptyStdPickupForm());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement | null>(null);

    const schema = createStdPickupFormSchema({
        mileageLimitRule,
        flatChargeLimitRule,
    });

    const isEditMode = initialValues !== undefined;

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm(initialValues ?? createEmptyStdPickupForm());
        setErrors({});
    }, [open, initialValues]);

    const totalValue = useMemo(() => calculateStdPickupFormTotal(form), [form]);

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

        setForm(createEmptyStdPickupForm(result.data.date));
        focusFirstFormControl(formRef.current);
    }

    function setChargeType(chargeType: StdPickupForm["chargeType"]) {
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

    function updateChargeFields(
        patch: Partial<
            Pick<StdPickupForm, "miles" | "ratePerMile" | "flatCharge">
        >,
    ) {
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
                ref={formRef}
                id="std-pickup-drawer-form"
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

                    <Field
                        label="Number of Households"
                        required
                        error={errors.numberOfHouseholds}
                    >
                        <Input
                            type="number"
                            min={1}
                            step={1}
                            value={form.numberOfHouseholds ?? ""}
                            state={errors.numberOfHouseholds ? "error" : "default"}
                            onChange={(event) => {
                                const value =
                                    event.target.value === ""
                                        ? null
                                        : Number(event.target.value);

                                setForm((prev) => ({
                                    ...prev,
                                    numberOfHouseholds: value,
                                }));

                                clearError("numberOfHouseholds");
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
                    errors={{
                        miles: errors.miles,
                        ratePerMile: errors.ratePerMile,
                        flatCharge: errors.flatCharge,
                    }}
                    defaultRatePerMile={mileageLimitRule?.maxRate ?? null}
                    onChange={updateChargeFields}
                />

                {errors.form && <Alert tone="danger">{errors.form}</Alert>}

                <StdTotalValueCard value={totalValue} />

                <RequisitionDrawerFormActions
                    isEditMode={isEditMode}
                    onCancel={onClose}
                    onSaveAndClose={() => saveForm("close")}
                />
            </form>
        </AppDrawer>
    );
}