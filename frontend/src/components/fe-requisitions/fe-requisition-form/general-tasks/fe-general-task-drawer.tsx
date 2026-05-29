"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { Check, Plus, X } from "lucide-react";

import { DatePicker } from "@/components/ui/date/date-picker";
import { Button } from "@/components/ui/button/button";
import { IconButton } from "@/components/ui/button/icon-button";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";

import type {
    RequisitionLimitRuleSummary,
} from "@/lib/api/requisition-limit-rules";

import { FeGeneralTaskForm } from "../types/fe-general-task-form";

import { calculateFeGeneralTaskFormTotals } from "../lib/calculate-fe-general-task-form";

import { createEmptyFeGeneralTaskForm } from "../lib/create-empty-fe-general-task-form";

import { mapZodErrors } from "../lib/map-zod-errors";

import { createFeGeneralTaskFormSchema } from "../schemas/create-fe-general-task-form-schema";

type Props = {
    open: boolean;

    title: string;

    limitRule?: RequisitionLimitRuleSummary;

    onClose: () => void;

    onSave: (
        form: FeGeneralTaskForm,
    ) => void;
};

export function FeGeneralTaskDrawer({
    open,
    title,
    limitRule,
    onClose,
    onSave,
}: Readonly<Props>) {

    const [form, setForm] =
        useState<FeGeneralTaskForm>(
            createEmptyFeGeneralTaskForm(),
        );

    const [errors, setErrors] =
        useState<
            Record<string, string>
        >({});

    const schema =
        createFeGeneralTaskFormSchema(
            limitRule,
        );

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm(
            createEmptyFeGeneralTaskForm(),
        );

        setErrors({});
    }, [open]);

    const totals = useMemo(
        () =>
            calculateFeGeneralTaskFormTotals(
                form,
            ),

        [form],
    );

    function handleSave() {
        const result =
            schema.safeParse(
                form,
            );

        if (!result.success) {
            setErrors(
                mapZodErrors(
                    result.error,
                ),
            );

            return;
        }

        setErrors({});

        onSave(result.data);

        onClose();
    }

    function handleSaveAndAddAnother() {
        const result =
            schema.safeParse(
                form,
            );

        if (!result.success) {
            setErrors(
                mapZodErrors(
                    result.error,
                ),
            );

            return;
        }

        setErrors({});

        onSave(result.data);

        setForm(
            createEmptyFeGeneralTaskForm(
                result.data.weekEndingDate,
            ),
        );
    }

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">

            <div
                className="
                    flex h-full w-full max-w-2xl
                    flex-col bg-background shadow-2xl
                "
            >

                <div
                    className="
                        flex items-center justify-between
                        border-b border-border
                        px-6 py-4
                    "
                >
                    <h2 className="text-lg font-semibold">
                        {title}
                    </h2>

                    <IconButton
                        variant="ghost"
                        tone="accent"
                        size="sm"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </IconButton>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    <Field
                        label="Week Ending"
                        error={
                            errors["weekEndingDate"]
                        }
                    >
                        <DatePicker
                            value={
                                form.weekEndingDate ??
                                undefined
                            }
                            onChange={(date) =>
                                setForm((prev) => ({
                                    ...prev,

                                    weekEndingDate:
                                        date ?? null,
                                }))
                            }
                        />
                    </Field>

                    <div className="grid grid-cols-7 gap-3">

                        <DayInput
                            label="Sun"
                            error={
                                errors["quantities.sunday"]
                            }
                            value={
                                form.quantities.sunday
                            }
                            onChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,

                                    quantities: {
                                        ...prev.quantities,

                                        sunday:
                                            value ?? null,
                                    },
                                }))
                            }
                        />

                        <DayInput
                            label="Mon"
                            error={
                                errors["quantities.monday"]
                            }
                            value={
                                form.quantities.monday
                            }
                            onChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,

                                    quantities: {
                                        ...prev.quantities,

                                        monday:
                                            value ?? null,
                                    },
                                }))
                            }
                        />

                        <DayInput
                            label="Tue"
                            error={
                                errors["quantities.tuesday"]
                            }
                            value={
                                form.quantities.tuesday
                            }
                            onChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,

                                    quantities: {
                                        ...prev.quantities,

                                        tuesday:
                                            value ?? null,
                                    },
                                }))
                            }
                        />

                        <DayInput
                            label="Wed"
                            error={
                                errors["quantities.wednesday"]
                            }
                            value={
                                form.quantities.wednesday
                            }
                            onChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,

                                    quantities: {
                                        ...prev.quantities,

                                        wednesday:
                                            value ?? null,
                                    },
                                }))
                            }
                        />

                        <DayInput
                            label="Thu"
                            error={
                                errors["quantities.thursday"]
                            }
                            value={
                                form.quantities.thursday
                            }
                            onChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,

                                    quantities: {
                                        ...prev.quantities,

                                        thursday:
                                            value ?? null,
                                    },
                                }))
                            }
                        />

                        <DayInput
                            label="Fri"
                            error={
                                errors["quantities.friday"]
                            }
                            value={
                                form.quantities.friday
                            }
                            onChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,

                                    quantities: {
                                        ...prev.quantities,

                                        friday:
                                            value ?? null,
                                    },
                                }))
                            }
                        />

                        <DayInput
                            label="Sat"
                            error={
                                errors["quantities.saturday"]
                            }
                            value={
                                form.quantities.saturday
                            }
                            onChange={(value) =>
                                setForm((prev) => ({
                                    ...prev,

                                    quantities: {
                                        ...prev.quantities,

                                        saturday:
                                            value ?? null,
                                    },
                                }))
                            }
                        />
                    </div>
                        {errors.form && (
                        <div
                            className="
                                rounded-lg border border-danger/30
                                bg-danger/5 px-3 py-2
                                text-sm text-danger
                            "
                        >
                            {errors.form}
                        </div>
                    )}

                    <Field
                        label="Rate Per Job"
                        error={
                            errors["ratePerJob"]
                        }
                    >
                        <Input
                            type="number"
                            value={
                                form.ratePerJob ?? ""
                            }
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,

                                    ratePerJob:
                                        e.target.value
                                            ? Number(
                                                e.target.value,
                                            )
                                            : null,
                                }))
                            }
                        />
                    </Field>

                    <div
                        className="
                            rounded-2xl border border-border
                            bg-surface p-4
                        "
                    >
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Total Jobs
                            </span>

                            <span className="font-medium">
                                {totals.totalJobs}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Total Value
                            </span>

                            <span className="font-medium">
                                £
                                {totals.totalValue.toFixed(
                                    2,
                                )}
                            </span>
                        </div>
                    </div>

                

                    {limitRule && (
                        <div
                            className="
                                rounded-xl border border-border
                                bg-muted/30 p-3 text-sm
                            "
                        >
                            <div>
                                Maximum quantity per day:
                                {" "}
                                <strong>
                                    {limitRule.maxQuantity}
                                </strong>
                            </div>

                            <div>
                                Maximum rate per Job:
                                {" "}
                                <strong>
                                    £
                                    {limitRule.maxRate.toFixed(
                                        2,
                                    )}
                                </strong>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">

                        <Button
                            tone="accent"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <div className="flex items-center gap-4">

                            <Button
                                className="min-w-[160px]"
                                variant="outline"
                                onClick={
                                    handleSaveAndAddAnother
                                }
                            >
                                <Plus className="h-4 w-4" />

                                Save & Add Another
                            </Button>

                            <Button
                                className="min-w-[160px]"
                                type="button"
                                onClick={handleSave}
                            >
                                <Check className="h-4 w-4" />

                                Save & Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

type DayInputProps = {
    label: string;

    value: number | null;

    error?: string;

    onChange: (
        value?: number,
    ) => void;
};

function DayInput({
    label,
    value,
    error,
    onChange,
}: Readonly<DayInputProps>) {

    return (
        <Field
            label={label}
            error={error}
        >
            <Input
                type="number"
                min={0}
                value={value ?? ""}
                onChange={(e) =>
                    onChange(
                        e.target.value
                            ? Number(
                                e.target.value,
                            )
                            : undefined,
                    )
                }
            />
        </Field>
    );
}
