"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fieldBase } from "@/components/ui/field/fieldstyles";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/field/input";
import { Field } from "@/components/ui/field/field";

import type { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { Alert } from "@/components/ui/alert";
import { getApiErrorMessage } from "@/lib/api/client";
import { categoryOptions, fasciaOptions } from "./requisition-limit-rule-options";

/* ---------------- FORM TYPES (STRING-FIRST) ---------------- */

type FormValues = {
    categoryId: string;
    fasciaId: string;
    feTaskTypeId: string | null;
    maxQuantity: number;
    maxRate: number;
};

const schema = z
    .object({
        categoryId: z.string().min(1, "Category is required and must be valid."),

        fasciaId: z.string().min(1, "Fascia is required and must be valid."),

        feTaskTypeId: z.string().nullable(),

        maxQuantity: z
            .number({
                error: "Max Quantity must be greater than 0.",
            })
            .gt(0, "Max Quantity must be greater than 0."),

        maxRate: z
            .number({
                error: "Max Rate must be greater than 0.",
            })
            .gt(0, "Max Rate must be greater than 0."),
    })
    .superRefine((data, ctx) => {
        const isGeneralTask = data.categoryId === "0";

        if (isGeneralTask && !data.feTaskTypeId) {
            ctx.addIssue({
                code: "custom",
                path: ["feTaskTypeId"],
                message:
                    "FeTaskTypeId is required only for GeneralTask and must be null for other categories.",
            });
        }

        if (!isGeneralTask && data.feTaskTypeId) {
            ctx.addIssue({
                code: "custom",
                path: ["feTaskTypeId"],
                message:
                    "FeTaskTypeId is required only for GeneralTask and must be null for other categories.",
            });
        }
    });

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        category: number;
        fascia: number;
        feTaskTypeId: string | null;
        maxQuantity: number;
        maxRate: number;
    }) => Promise<void>;
    initial?: RequisitionLimitRuleSummary | null;
    taskTypes: FeTaskType[];
};

export function RequisitionLimitRuleFormModal({
    open,
    onClose,
    onSubmit,
    initial,
    taskTypes,
}: Readonly<Props>) {
    const isEditing = !!initial;
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            categoryId: "",
            fasciaId: "",
            feTaskTypeId: null,
            maxQuantity: 0,
            maxRate: 0,
        },
    });

    const categoryId = useWatch({ control, name: "categoryId" });
    const isGeneralTask = categoryId === "0";
    const maxRateLabel = categoryId === "5" ? "Fixed Van Pack Price (£)" : "Max Rate (£)";

    useEffect(() => {
        if (!open) return;

        reset({
            categoryId: initial ? String(initial.categoryId) : "",
            fasciaId: initial ? String(initial.fasciaId) : "",
            feTaskTypeId: initial?.feTaskTypeId ?? null,
            maxQuantity: initial?.maxQuantity ?? 0,
            maxRate: initial?.maxRate ?? 0,
        });

        setServerError(null);
    }, [open, initial, reset]);

    /* ---------------- clear task type safely ---------------- */

    useEffect(() => {
        if (!isGeneralTask) {
            setValue("feTaskTypeId", null);
        }
    }, [isGeneralTask, setValue]);

    /* ---------------- submit ---------------- */

    async function onValid(data: FormValues) {
        try {
            const category = Number(data.categoryId);

            await onSubmit({
                category,
                fascia: Number(data.fasciaId),
                feTaskTypeId: category === 0 ? data.feTaskTypeId || null : null,
                maxQuantity: data.maxQuantity,
                maxRate: data.maxRate,
            });
        } catch (err) {
            setServerError(getApiErrorMessage(err, "Failed to save requisition limit rule."));
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Limit Rule" : "Create Limit Rule"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                {serverError && <Alert tone="danger">{serverError}</Alert>}

                {/* CATEGORY */}
                <Field label="Category" required error={errors.categoryId?.message}>
                    <select className={fieldBase} {...register("categoryId")}>
                        <option value="">Select category</option>
                        {categoryOptions.map((opt) => (
                            <option key={opt.value} value={String(opt.value)}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {/* FASCIA */}
                <Field label="Fascia" required error={errors.fasciaId?.message}>
                    <select className={fieldBase} {...register("fasciaId")}>
                        <option value="">Select fascia</option>
                        {fasciaOptions.map((opt) => (
                            <option key={opt.value} value={String(opt.value)}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {/* TASK TYPE */}
                {isGeneralTask && (
                    <Field label="Task Type" error={errors.feTaskTypeId?.message}>
                        <select className={fieldBase} {...register("feTaskTypeId")}>
                            <option value="">None</option>
                            {taskTypes.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                )}

                {/* Max Quantity */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Max Quantity */}
                    <Field label="Max Quantity" required error={errors.maxQuantity?.message}>
                        <Input
                            type="number"
                            {...register("maxQuantity", { valueAsNumber: true })}
                        />
                    </Field>

                    {/* Max Rate */}
                    <Field label={maxRateLabel} required error={errors.maxRate?.message}>
                        <Input
                            type="number"
                            step="0.01"
                            {...register("maxRate", {
                                valueAsNumber: true,
                            })}
                        />
                    </Field>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button type="submit" loading={isSubmitting}>
                        {isEditing ? "Save Changes" : "Create"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
