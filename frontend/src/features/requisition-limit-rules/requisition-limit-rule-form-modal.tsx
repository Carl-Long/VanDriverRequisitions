"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { Field } from "@/components/ui/field/field";
import { fieldBase } from "@/components/ui/field/fieldstyles";
import { Input } from "@/components/ui/field/input";
import { Modal } from "@/components/ui/modal";
import type { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import type { RequisitionLimitRuleCategory, RequisitionLimitRuleFascia, RequisitionLimitRuleSummary, } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { getApiErrorMessage } from "@/lib/api/client";

import { categoryOptions, fasciaOptions, requisitionLimitRuleCategories, requisitionLimitRuleFascias } from "./requisition-limit-rule-options";
import { InactiveLookupWarning } from "../requisitions-shared/components/inactive-lookup-warning";
import { hasMaxTwoDecimalPlaces, MIN_MONEY_AMOUNT } from "@/lib/validation/money";

type FormValues = {
    category: RequisitionLimitRuleCategory | "";
    fascia: RequisitionLimitRuleFascia | "";
    feTaskTypeId: string | null;
    maxQuantity: number;
    maxRate: number;
};

const positiveIntegerInputSchema = (label: string) =>
    z
        .number({
            error: `${label} is required.`,
        })
        .refine((value) => !Number.isNaN(value), {
            message: `${label} is required.`,
        })
        .int(`${label} must be a whole number.`)
        .gt(0, `${label} must be greater than 0.`);

const positiveMoneyInputSchema = (label: string) =>
    z
        .number({
            error: `${label} is required.`,
        })
        .refine((value) => !Number.isNaN(value), {
            message: `${label} is required.`,
        })
        .min(MIN_MONEY_AMOUNT, `${label} must be at least £0.01.`)
        .refine(
            hasMaxTwoDecimalPlaces,
            `${label} can have a maximum of 2 decimal places.`,
        );

const schema = z
    .object({
        category: z
            .union([z.literal(""), z.enum(requisitionLimitRuleCategories)])
            .refine((value) => value !== "", {
                message: "Category is required and must be valid.",
            }),

        fascia: z
            .union([z.literal(""), z.enum(requisitionLimitRuleFascias)])
            .refine((value) => value !== "", {
                message: "Fascia is required and must be valid.",
            }),

        feTaskTypeId: z.string().nullable(),

        maxQuantity: positiveIntegerInputSchema("Max Quantity"),
        maxRate: positiveMoneyInputSchema("Max Rate"),
    })
    .superRefine((data, ctx) => {
        const isGeneralTask = data.category === "GeneralTask";

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
        category: RequisitionLimitRuleCategory;
        fascia: RequisitionLimitRuleFascia;
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
            category: "",
            fascia: "",
            feTaskTypeId: null,
            maxQuantity: 0,
            maxRate: 0,
        },
    });

    const category = useWatch({ control, name: "category" });
    const isGeneralTask = category === "GeneralTask";
    const maxRateLabel = category === "VanPack" ? "Fixed Van Pack Price (£)" : "Max Rate (£)";

    const visibleTaskTypes = useMemo(
        () =>
            taskTypes.filter(
                (taskType) =>
                    taskType.isActive ||
                    (isEditing && taskType.id === initial?.feTaskTypeId),
            ),
        [taskTypes, isEditing, initial?.feTaskTypeId],
    );

    const selectedTaskType = useMemo(
        () =>
            taskTypes.find(
                (taskType) => taskType.id === initial?.feTaskTypeId,
            ) ?? null,
        [taskTypes, initial?.feTaskTypeId],
    );

    const showInactiveTaskTypeWarning =
        isGeneralTask &&
        isEditing &&
        Boolean(initial?.feTaskTypeId) &&
        selectedTaskType?.isActive === false;

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            category: initial ? initial.category : "",
            fascia: initial ? initial.fascia : "",
            feTaskTypeId: initial?.feTaskTypeId ?? null,
            maxQuantity: initial?.maxQuantity ?? 0,
            maxRate: initial?.maxRate ?? 0,
        });

        setServerError(null);
    }, [open, initial, reset]);

    useEffect(() => {
        if (!isGeneralTask) {
            setValue("feTaskTypeId", null);
        }
    }, [isGeneralTask, setValue]);

    async function onValid(data: FormValues) {
        if (!data.category || !data.fascia) {
            return;
        }

        try {
            await onSubmit({
                category: data.category,
                fascia: data.fascia,
                feTaskTypeId:
                    data.category === "GeneralTask"
                        ? data.feTaskTypeId || null
                        : null,
                maxQuantity: data.maxQuantity,
                maxRate: data.maxRate,
            });
        } catch (err) {
            setServerError(
                getApiErrorMessage(
                    err,
                    "Failed to save requisition limit rule.",
                ),
            );
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Limit Rule" : "Create Limit Rule"}
        >
            <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-5">
                {serverError && <Alert tone="danger">{serverError}</Alert>}

                <Field label="Category" required error={errors.category?.message}>
                    <select className={fieldBase} {...register("category")}>
                        <option value="">Select category</option>

                        {categoryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Fascia" required error={errors.fascia?.message}>
                    <select className={fieldBase} {...register("fascia")}>
                        <option value="">Select fascia</option>

                        {fasciaOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {isGeneralTask && (
                    <Field
                        label="Task Type"
                        error={errors.feTaskTypeId?.message}
                    >
                        <select
                            className={fieldBase}
                            {...register("feTaskTypeId")}
                        >
                            <option value="">None</option>

                            {visibleTaskTypes.map((taskType) => (
                                <option key={taskType.id} value={taskType.id}>
                                    {taskType.isActive ? taskType.name : `${taskType.name} (Inactive)`}
                                </option>
                            ))}
                        </select>
                        {showInactiveTaskTypeWarning && (
                            <InactiveLookupWarning label="task type" variant="field" />
                        )}
                    </Field>
                )}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field
                        label="Max Quantity"
                        required
                        error={errors.maxQuantity?.message}
                    >
                        <Input
                            type="number"
                            {...register("maxQuantity", {
                                valueAsNumber: true,
                            })}
                        />
                    </Field>

                    <Field
                        label={maxRateLabel}
                        required
                        error={errors.maxRate?.message}
                    >
                        <Input
                            type="number"
                            step="0.01"
                            {...register("maxRate", {
                                valueAsNumber: true,
                            })}
                        />
                    </Field>
                </div>

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