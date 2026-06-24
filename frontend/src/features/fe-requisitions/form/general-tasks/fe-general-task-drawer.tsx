"use client";

import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AppDrawer } from "@/components/ui/drawer";
import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { formatCurrencyGB } from "@/lib/format/currency";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { FeGeneralTaskForm } from "../types/fe-general-task-form";
import { calculateFeGeneralTaskFormTotals } from "../lib/calculate-fe-general-task-form";
import { createEmptyFeGeneralTaskForm } from "../lib/create-empty-fe-general-task-form";
import { mapZodErrors } from "../../../requisitions-shared/lib/map-zod-errors";
import { createFeGeneralTaskFormSchema } from "../schemas/create-fe-general-task-form-schema";
import { DayInput } from "../form-fields/day-input";
import { RequisitionDrawerFormActions } from "@/features/requisitions-shared/components/requisition-drawer-form-actions";

type Props = {
    open: boolean;
    title: string;
    limitRule?: RequisitionLimitRuleSummary;
    initialValues?: FeGeneralTaskForm;
    onClose: () => void;
    onSave: (form: FeGeneralTaskForm) => void;
};

type SubmitIntent = "close" | "add-another";

export function FeGeneralTaskDrawer({
    open,
    title,
    limitRule,
    initialValues,
    onClose,
    onSave,
}: Readonly<Props>) {
    const [form, setForm] = useState<FeGeneralTaskForm>(createEmptyFeGeneralTaskForm());
    const [errors, setErrors] = useState<Record<string, string>>({});

    const schema = createFeGeneralTaskFormSchema(limitRule);
    const isEditMode = initialValues !== undefined;

    useEffect(() => {
        if (!open) return;

        setForm(initialValues ?? createEmptyFeGeneralTaskForm());
        setErrors({});
    }, [open, initialValues]);

    const totals = useMemo(() => calculateFeGeneralTaskFormTotals(form), [form]);

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

        setForm(createEmptyFeGeneralTaskForm(result.data.weekEndingDate));
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
                id="general-task-drawer-form"
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
                            <div className="font-medium">Requisition Item Limits</div>

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
                        <span className="text-muted-foreground">Total Jobs</span>

                        <span className="font-medium">{totals.totalJobs}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Value</span>

                        <span className="font-medium">
                            {formatCurrencyGB(totals.totalValue)}
                        </span>
                    </div>
                </div>

                <RequisitionDrawerFormActions
                    isEditMode={isEditMode}
                    onCancel={onClose}
                    onSaveAndClose={() => saveForm("close")}
                />
            </form>
        </AppDrawer>
    );
}