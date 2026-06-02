"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fieldBase } from "@/components/ui/field/fieldstyles";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/field/input";
import { Field } from "@/components/ui/field/field";

import type { FeTaskType } from "@/lib/api/fe-task-types";
import type { RequisitionLimitRuleSummary } from "@/lib/api/requisition-limit-rules";

import { ApiError } from "@/lib/api/client";
import {
    categoryOptions,
    fasciaOptions,
} from "./requisition-limit-rule-options";
import { Alert } from "../ui/alert";

/* ---------------- FORM TYPES (STRING-FIRST) ---------------- */

type FormValues = {
    categoryId: string;
    fasciaId: string;
    feTaskTypeId: string | null;
    maxQuantity: number;
    maxRate: number;
};

/* ---------------- schema ---------------- */

const schema = z.object({
    categoryId: z.string().min(1),
    fasciaId: z.string().min(1),
    feTaskTypeId: z.string().nullable(),
    maxQuantity: z.number(),
    maxRate: z.number(),
});

/* ---------------- props ---------------- */

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        categoryId: number;
        fasciaId: number;
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
        formState: { isSubmitting },
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

    /* ---------------- watch ---------------- */

    const categoryId = useWatch({ control, name: "categoryId" });

    const categoryLabel = useMemo(() => {
        return categoryOptions.find(x => x.value === categoryId)?.label;
    }, [categoryId]);

    const isGeneralTask = categoryLabel === "General Task";

    /* ---------------- hydrate form ---------------- */

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
            await onSubmit({
                categoryId: Number(data.categoryId),
                fasciaId: Number(data.fasciaId),
                feTaskTypeId: data.feTaskTypeId,
                maxQuantity: data.maxQuantity,
                maxRate: data.maxRate,
            });

            onClose();
        } catch (err) {
            if (err instanceof ApiError) {
                setServerError(err.message ?? "Error");
            } else {
                setServerError("Unexpected error occurred.");
            }
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Limit Rule" : "Create Limit Rule"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">

                {serverError && (
                    <Alert tone="danger">
                        {serverError}
                    </Alert>
                )}

                {/* CATEGORY */}
                <Field label="Category" required>
                    <select className={fieldBase} {...register("categoryId")}>
                        <option value="">Select category</option>
                        {categoryOptions.map(opt => (
                            <option key={opt.value} value={String(opt.value)}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {/* FASCIA */}
                <Field label="Fascia" required>
                    <select className={fieldBase} {...register("fasciaId")}>
                        <option value="">Select fascia</option>
                        {fasciaOptions.map(opt => (
                            <option key={opt.value} value={String(opt.value)}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {/* TASK TYPE */}
                {isGeneralTask && (
                    <Field label="Task Type">
                        <select className={fieldBase} {...register("feTaskTypeId")}>
                            <option value="">None</option>
                            {taskTypes.map(t => (
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
                    <Field label="Max Quantity" required>
                        <Input
                            type="number"
                            {...register("maxQuantity", { valueAsNumber: true })}
                        />
                    </Field>

                    {/* Max Rate */}
                    <Field label="Max Rate" required>
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

                    <Button
                        type="submit"
                        loading={isSubmitting}
                    >
                        {isEditing ? "Save Changes" : "Create"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}