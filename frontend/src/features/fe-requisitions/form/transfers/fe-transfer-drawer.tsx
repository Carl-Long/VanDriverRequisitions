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
import { FeTransferForm } from "../types/fe-transfer-form";
import { calculateFeTransferFormTotals } from "../lib/calculate-fe-transfer-form";
import { createEmptyFeTransferForm } from "../lib/create-empty-fe-transfer-form";
import { createFeTransferFormSchema } from "../schemas/create-fe-transfer-form-schema";
import { mapZodErrors } from "../../../requisitions-shared/lib/map-zod-errors";
import { DayInput } from "../form-fields/day-input";
import { ShopFilterField } from "@/features/requisitions-shared/components/filter-fields/shop-filter-field";

type Props = {
    open: boolean;
    title: string;
    limitRule?: RequisitionLimitRuleSummary;
    initialValues?: FeTransferForm;
    onClose: () => void;
    onSave: (form: FeTransferForm) => void;
};

type SubmitIntent = "close" | "add-another";

export function FeTransferDrawer({
    open,
    title,
    limitRule,
    initialValues,
    onClose,
    onSave,
}: Readonly<Props>) {
    const [form, setForm] = useState<FeTransferForm>(createEmptyFeTransferForm());
    const [errors, setErrors] = useState<Record<string, string>>({});

    const schema = createFeTransferFormSchema(limitRule);
    const isEditMode = initialValues !== undefined;

    useEffect(() => {
        if (!open) return;

        setForm(initialValues ?? createEmptyFeTransferForm());
        setErrors({});
    }, [open, initialValues]);

    const totals = useMemo(() => calculateFeTransferFormTotals(form), [form]);

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

        setForm(createEmptyFeTransferForm(result.data.weekEndingDate));
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
                                form="transfer-drawer-form"
                                type="submit"
                                className="min-w-[160px]"
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
                id="transfer-drawer-form"
                noValidate
                className="space-y-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    saveForm(isEditMode ? "close" : "add-another");
                }}
            >
                {limitRule && (
                    <div className="flex gap-3 rounded-xl border border-border bg-surface-subtle p-4">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                        <div className="text-sm">
                            <div className="font-medium">Transfer Limits</div>

                            <div className="mt-1 text-muted-foreground">
                                Maximum quantity per day:{" "}
                                <strong className="text-foreground">
                                    {limitRule.maxQuantity}
                                </strong>
                            </div>

                            <div className="text-muted-foreground">
                                Maximum rate per job:{" "}
                                <strong className="text-foreground">
                                    {formatCurrencyGB(limitRule.maxRate)}
                                </strong>
                            </div>
                        </div>
                    </div>
                )}

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

                <div className="space-y-4">
                    <ShopFilterField
                        required
                        fieldLabel="From Shop"
                        placeholder="Select from shop"
                        value={form.shopIdFrom}
                        label={form.shopLabelFrom}
                        error={errors["shopIdFrom"]}
                        onChange={(value, label) => {
                            setForm((prev) => ({
                                ...prev,
                                shopIdFrom: value,
                                shopLabelFrom: label,
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
                        error={errors["shopIdTo"]}
                        onChange={(value, label) => {
                            setForm((prev) => ({
                                ...prev,
                                shopIdTo: value,
                                shopLabelTo: label,
                            }));

                            clearError("shopIdTo");
                            clearError("form");
                        }}
                    />
                </div>

                <div className="grid grid-cols-7 gap-3">
                    <DayInput
                        label="Sun"
                        error={errors["quantities.sunday"]}
                        value={form.quantities.sunday}
                        onChange={(value) => {
                            setForm((prev) => ({
                                ...prev,
                                quantities: {
                                    ...prev.quantities,
                                    sunday: value ?? null,
                                },
                            }));

                            clearError("quantities.sunday");
                            clearError("form");
                        }}
                    />

                    <DayInput
                        label="Mon"
                        error={errors["quantities.monday"]}
                        value={form.quantities.monday}
                        onChange={(value) => {
                            setForm((prev) => ({
                                ...prev,
                                quantities: {
                                    ...prev.quantities,
                                    monday: value ?? null,
                                },
                            }));

                            clearError("quantities.monday");
                            clearError("form");
                        }}
                    />

                    <DayInput
                        label="Tue"
                        error={errors["quantities.tuesday"]}
                        value={form.quantities.tuesday}
                        onChange={(value) => {
                            setForm((prev) => ({
                                ...prev,
                                quantities: {
                                    ...prev.quantities,
                                    tuesday: value ?? null,
                                },
                            }));

                            clearError("quantities.tuesday");
                            clearError("form");
                        }}
                    />

                    <DayInput
                        label="Wed"
                        error={errors["quantities.wednesday"]}
                        value={form.quantities.wednesday}
                        onChange={(value) => {
                            setForm((prev) => ({
                                ...prev,
                                quantities: {
                                    ...prev.quantities,
                                    wednesday: value ?? null,
                                },
                            }));

                            clearError("quantities.wednesday");
                            clearError("form");
                        }}
                    />

                    <DayInput
                        label="Thu"
                        error={errors["quantities.thursday"]}
                        value={form.quantities.thursday}
                        onChange={(value) => {
                            setForm((prev) => ({
                                ...prev,
                                quantities: {
                                    ...prev.quantities,
                                    thursday: value ?? null,
                                },
                            }));

                            clearError("quantities.thursday");
                            clearError("form");
                        }}
                    />

                    <DayInput
                        label="Fri"
                        error={errors["quantities.friday"]}
                        value={form.quantities.friday}
                        onChange={(value) => {
                            setForm((prev) => ({
                                ...prev,
                                quantities: {
                                    ...prev.quantities,
                                    friday: value ?? null,
                                },
                            }));

                            clearError("quantities.friday");
                            clearError("form");
                        }}
                    />

                    <DayInput
                        label="Sat"
                        error={errors["quantities.saturday"]}
                        value={form.quantities.saturday}
                        onChange={(value) => {
                            setForm((prev) => ({
                                ...prev,
                                quantities: {
                                    ...prev.quantities,
                                    saturday: value ?? null,
                                },
                            }));

                            clearError("quantities.saturday");
                            clearError("form");
                        }}
                    />
                </div>

                {errors.form && <Alert>{errors.form}</Alert>}

                <Field label="Rate Per Job (£)" required error={errors["ratePerJob"]}>
                    <div className="max-w-[200px]">
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
                            }}
                        />
                    </div>
                </Field>

                <div className="rounded-2xl border border-border bg-surface-subtle p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Quantity</span>
                        <span className="font-medium">{totals.totalNumber}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-medium">
                            {formatCurrencyGB(totals.totalValue)}
                        </span>
                    </div>
                </div>
            </form>
        </AppDrawer>
    );
}