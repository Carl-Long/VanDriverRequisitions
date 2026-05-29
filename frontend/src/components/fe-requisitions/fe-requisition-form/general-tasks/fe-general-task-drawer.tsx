"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { DatePicker } from "@/components/ui/date/date-picker";
import { calculateFeGeneralTaskFormTotals } from "../lib/calculate-fe-general-task-form";
import { createEmptyFeGeneralTaskForm } from "../lib/create-empty-fe-general-task-form";
import { FeGeneralTaskFormDraft } from "../types/fe-general-task-form-draft";
import { feGeneralTaskFormSchema } from "../schemas/fe-general-task-form-schema";
import { mapZodErrors } from "../lib/map-zod-errors";


type Props = {
    open: boolean;

    title: string;

    onClose: () => void;

    onSave: (
        form: FeGeneralTaskFormDraft,
    ) => void;
};

export function FeGeneralTaskDrawer({
    open,

    title,

    onClose,

    onSave,
}: Readonly<Props>) {
    const [form, setForm] =
        useState<FeGeneralTaskFormDraft>(
            createEmptyFeGeneralTaskForm(),
        );

    const [errors, setErrors] =
        useState<
            Record<
                string,
                string
            >
        >({});


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
            feGeneralTaskFormSchema.safeParse(
                form,
            );

        if (
            !result.success
        ) {
            setErrors(
                mapZodErrors(
                    result.error,
                ),
            );

            return;
        }

        setErrors({});

        onSave(result.data);
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
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Close
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <Field
                        label="Week Ending"
                        error={
                            errors[
                            "weekEndingDate"
                            ]
                        }
                    >
                        <DatePicker
                            value={
                                form.weekEndingDate
                            }
                            onChange={(
                                date,
                            ) =>
                                setForm(
                                    (
                                        prev,
                                    ) => ({
                                        ...prev,

                                        weekEndingDate:
                                            date,
                                    }),
                                )
                            }
                        />
                    </Field>

                    <div className="grid grid-cols-7 gap-3">
                        <DayInput
                            label="Sun"
                            error={
                                errors["sunday"]
                            }
                            value={
                                form.sunday
                            }
                            onChange={(
                                value,
                            ) =>
                                setForm(
                                    (
                                        prev,
                                    ) => ({
                                        ...prev,

                                        sunday:
                                            value,
                                    }),
                                )
                            }
                        />

                        <DayInput
                            label="Mon"
                             error={
                                errors["monday"]
                            }
                            value={
                                form.monday
                            }
                            onChange={(
                                value,
                            ) =>
                                setForm(
                                    (
                                        prev,
                                    ) => ({
                                        ...prev,

                                        monday:
                                            value,
                                    }),
                                )
                            }
                        />

                        <DayInput
                            label="Tue"
                             error={
                                errors["tuesday"]
                            }
                            value={
                                form.tuesday
                            }
                            onChange={(
                                value,
                            ) =>
                                setForm(
                                    (
                                        prev,
                                    ) => ({
                                        ...prev,

                                        tuesday:
                                            value,
                                    }),
                                )
                            }
                        />

                        <DayInput
                            label="Wed"
                             error={
                                errors["wednesday"]
                            }
                            value={
                                form.wednesday
                            }
                            onChange={(
                                value,
                            ) =>
                                setForm(
                                    (
                                        prev,
                                    ) => ({
                                        ...prev,

                                        wednesday:
                                            value,
                                    }),
                                )
                            }
                        />

                        <DayInput
                            label="Thu"
                             error={
                                errors["thursday"]
                            }
                            value={
                                form.thursday
                            }
                            onChange={(
                                value,
                            ) =>
                                setForm(
                                    (
                                        prev,
                                    ) => ({
                                        ...prev,

                                        thursday:
                                            value,
                                    }),
                                )
                            }
                        />

                        <DayInput
                            label="Fri"
                             error={
                                errors["friday"]
                            }
                            value={
                                form.friday
                            }
                            onChange={(
                                value,
                            ) =>
                                setForm(
                                    (
                                        prev,
                                    ) => ({
                                        ...prev,

                                        friday:
                                            value,
                                    }),
                                )
                            }
                        />

                        <DayInput
                            label="Sat"
                             error={
                                errors["saturday"]
                            }
                            value={
                                form.saturday
                            }
                            onChange={(
                                value,
                            ) =>
                                setForm(
                                    (
                                        prev,
                                    ) => ({
                                        ...prev,

                                        saturday:
                                            value,
                                    }),
                                )
                            }
                        />
                    </div>

                    <Field
                        label="Rate Per Job"
                        error={
                            errors[
                            "ratePerJob"
                            ]
                        }
                    >
                        <Input
                            type="number"
                            value={
                                form.ratePerJob ??
                                ""
                            }
                            onChange={(
                                e,
                            ) =>
                                setForm(
                                    (
                                        prev,
                                    ) => ({
                                        ...prev,

                                        ratePerJob:
                                            Number(
                                                e
                                                    .target
                                                    .value,
                                            ),
                                    }),
                                )
                            }
                        />
                    </Field>

                    <div className="rounded-2xl border border-border bg-surface p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Total Jobs
                            </span>

                            <span className="font-medium">
                                {
                                    totals.totalJobs
                                }
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
                </div>

                <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-xl border border-border
                            px-4 py-2 text-sm
                        "
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="
                            rounded-xl bg-primary
                            px-4 py-2 text-sm
                            text-primary-foreground
                        "
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

type DayInputProps = {
    label: string;
    value?: number;
    error?: string;

    onChange: (
        value?: number,
    ) => void;
};

function DayInput({
    label,
    error,
    value,

    onChange,
}: Readonly<DayInputProps>) {
    return (
        <Field label={label} error={error}>
            <Input
                type="number"
                min={0}
                value={value ?? ""}
                onChange={(e) =>
                    onChange(
                        e.target.value
                            ? Number(
                                e.target
                                    .value,
                            )
                            : undefined,
                    )
                }
            />
        </Field>
    );
}