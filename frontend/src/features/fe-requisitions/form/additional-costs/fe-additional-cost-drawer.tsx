"use client";

import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from "react";
import { Info, Plus } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { AppDrawer, DrawerFormActions } from "@/components/ui/drawer";
import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { formatCurrencyGB } from "@/lib/format/currency";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import type { ChargingOption } from "@/features/fe-requisitions/types/fe-requisition.types";

import { createEmptyFeAdditionalCostForm } from "../lib/create-empty-fe-additional-cost-form";
import { createFeAdditionalCostFormSchema } from "../schemas/create-fe-additional-cost-form-schema";
import { mapZodErrors } from "../../../requisitions-shared/lib/map-zod-errors";
import { FeReasonField } from "../form-fields/fe-reason-field";
import { calculateFeAdditionalCostFormTotals } from "../lib/calculate-fe-additional-cost.form";
import { FeAdditionalCostForm } from "../types/fe-additional-cost-form";
import { RatePerMileField } from "@/features/requisitions-shared/components/form-fields/rate-per-mile-field";
import { CostReasonField } from "@/features/cost-reasons/cost-reason-field";
import { FASCIAS } from "@/lib/constants/fascias";

type Props = {
    open: boolean;
    title: string;
    additionalCostLimitRule?: RequisitionLimitRuleSummary;
    mileageLimitRule?: RequisitionLimitRuleSummary;
    initialValues?: FeAdditionalCostForm;
    onClose: () => void;
    onSave: (form: FeAdditionalCostForm) => void;
};

type SubmitIntent = "close" | "add-another";

export function FeAdditionalCostDrawer({
    open,
    title,
    additionalCostLimitRule,
    mileageLimitRule,
    initialValues,
    onClose,
    onSave,
}: Readonly<Props>) {
    const [form, setForm] = useState<FeAdditionalCostForm>(createEmptyFeAdditionalCostForm());
    const [errors, setErrors] = useState<Record<string, string>>({});

    const schema = createFeAdditionalCostFormSchema({
        additionalCostLimitRule,
        mileageLimitRule,
    });

    const isEditMode = initialValues !== undefined;

    useEffect(() => {
        if (!open) return;

        setForm(initialValues ?? createEmptyFeAdditionalCostForm());
        setErrors({});
    }, [open, initialValues]);

    const totals = useMemo(() => calculateFeAdditionalCostFormTotals(form), [form]);

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

        setForm(createEmptyFeAdditionalCostForm(result.data.weekEndingDate));
    }

    function setChargingOption(chargingOption: ChargingOption) {
        setForm((prev) => ({
            ...prev,
            chargingOption,

            totalNumber: chargingOption === "Job" ? prev.totalNumber : null,
            ratePerJob: chargingOption === "Job" ? prev.ratePerJob : null,

            miles: chargingOption === "Mileage" ? prev.miles : null,
            ratePerMile: chargingOption === "Mileage" ? prev.ratePerMile : null,
        }));

        setErrors({});
    }

    function clearError(field: string) {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
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
                id="additional-cost-drawer-form"
                noValidate
                className="space-y-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    saveForm(isEditMode ? "close" : "add-another");
                }}
            >
                <LimitSummary
                    chargingOption={form.chargingOption}
                    additionalCostLimitRule={additionalCostLimitRule}
                    mileageLimitRule={mileageLimitRule}
                />

                <Field label="Week Ending" required error={errors["weekEndingDate"]}>
                    <DatePicker
                        value={form.weekEndingDate ?? undefined}
                        onChange={(date) => {
                            setForm((prev) => ({
                                ...prev,
                                weekEndingDate: date ?? null,
                            }));

                            clearError("weekEndingDate");
                        }}
                    />
                </Field>

                <CostReasonField
                    fascia={FASCIAS.FE}
                    required
                    value={form.reasonId}
                    reasonCode={form.reasonCode}
                    reasonText={form.reasonText}
                    isReasonActive={form.isReasonActive}
                    error={errors["reasonId"]}
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

                <Field label="Charging Option" required error={errors["chargingOption"]}>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant={form.chargingOption === "Job" ? "solid" : "outline"}
                            onClick={() => setChargingOption("Job")}
                        >
                            Job
                        </Button>

                        <Button
                            type="button"
                            variant={form.chargingOption === "Mileage" ? "solid" : "outline"}
                            onClick={() => setChargingOption("Mileage")}
                        >
                            Mileage
                        </Button>
                    </div>
                </Field>

                {form.chargingOption === "Job" ? (
                    <JobFields
                        form={form}
                        errors={errors}
                        setForm={setForm}
                        clearError={clearError}
                    />
                ) : (
                    <MileageFields
                        form={form}
                        errors={errors}
                        setForm={setForm}
                        clearError={clearError}
                        defaultRatePerMile={mileageLimitRule?.maxRate ?? null}
                    />
                )}

                {errors.form && <Alert>{errors.form}</Alert>}

                <div className="rounded-2xl border border-border bg-surface-subtle p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-medium">{formatCurrencyGB(totals.totalValue)}</span>
                    </div>
                </div>

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

type LimitSummaryProps = {
    chargingOption: ChargingOption;
    additionalCostLimitRule?: RequisitionLimitRuleSummary;
    mileageLimitRule?: RequisitionLimitRuleSummary;
};

function LimitSummary({
    chargingOption,
    additionalCostLimitRule,
    mileageLimitRule,
}: Readonly<LimitSummaryProps>) {
    const activeRule =
        chargingOption === "Mileage" ? mileageLimitRule : additionalCostLimitRule;

    return (
        <div className="flex gap-3 rounded-xl border border-border bg-surface-subtle p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

            <div className="text-sm">
                <div className="font-medium">
                    {chargingOption === "Mileage"
                        ? "Additional Mileage Limits"
                        : "Additional Job Limits"}
                </div>

                {activeRule ? (
                    <>
                        <div className="mt-1 text-muted-foreground">
                            Maximum {chargingOption === "Mileage" ? "miles" : "quantity"}:{" "}
                            <strong className="text-foreground">{activeRule.maxQuantity}</strong>
                        </div>

                        <div className="text-muted-foreground">
                            Maximum rate:{" "}
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

type ConditionalFieldsProps = {
    form: FeAdditionalCostForm;
    errors: Record<string, string>;
    setForm: Dispatch<SetStateAction<FeAdditionalCostForm>>;
    clearError: (field: string) => void;
    defaultRatePerMile?: number | null;
};

function JobFields({ form, errors, setForm, clearError }: Readonly<ConditionalFieldsProps>) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Field label="Total Number" required error={errors["totalNumber"]}>
                <Input
                    type="number"
                    min={1}
                    step={1}
                    value={form.totalNumber ?? ""}
                    state={errors["totalNumber"] ? "error" : "default"}
                    onChange={(e) => {
                        setForm((prev) => ({
                            ...prev,
                            totalNumber: e.target.value ? Number(e.target.value) : null,
                        }));

                        clearError("totalNumber");
                        clearError("form");
                    }}
                />
            </Field>

            <Field label="Rate Per Job (£)" required error={errors["ratePerJob"]}>
                <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.ratePerJob ?? ""}
                    state={errors["ratePerJob"] ? "error" : "default"}
                    onChange={(e) => {
                        setForm((prev) => ({
                            ...prev,
                            ratePerJob: e.target.value ? Number(e.target.value) : null,
                        }));

                        clearError("ratePerJob");
                        clearError("form");
                    }}
                />
            </Field>
        </div>
    );
}

function MileageFields({
    form,
    errors,
    setForm,
    clearError,
    defaultRatePerMile,
}: Readonly<ConditionalFieldsProps>) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Field label="Miles" required error={errors["miles"]}>
                <Input
                    type="number"
                    min={1}
                    step={1}
                    value={form.miles ?? ""}
                    state={errors["miles"] ? "error" : "default"}
                    onChange={(e) => {
                        setForm((prev) => ({
                            ...prev,
                            miles: e.target.value ? Number(e.target.value) : null,
                        }));

                        clearError("miles");
                        clearError("form");
                    }}
                />
            </Field>

            <RatePerMileField
                value={form.ratePerMile}
                defaultValue={defaultRatePerMile ?? null}
                error={errors["ratePerMile"]}
                onChange={(ratePerMile) => {
                    setForm((prev) => ({
                        ...prev,
                        ratePerMile,
                    }));
                }}
                onClearError={() => {
                    clearError("ratePerMile");
                    clearError("form");
                }}
            />
        </div>
    );
}