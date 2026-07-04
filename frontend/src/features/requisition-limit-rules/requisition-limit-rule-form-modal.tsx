"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminFormServerError } from "@/features/admin-shared/admin-form-server-error";
import { AdminModalFormActions } from "@/features/admin-shared/admin-modal-form-actions";
import { Field } from "@/components/ui/field/field";
import { fieldBase } from "@/components/ui/field/fieldstyles";
import { Input } from "@/components/ui/field/input";
import { Modal } from "@/components/ui/modal";
import type { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import type { RequisitionLimitRuleCategory, RequisitionLimitRuleFascia, RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { InactiveLookupWarning } from "@/features/requisitions-shared/components/inactive-lookup-warning";
import { getApiErrorMessage } from "@/lib/api/client";
import { hasMaxTwoDecimalPlaces, MIN_MONEY_AMOUNT } from "@/lib/validation/money";

import {
    fasciaOptions,
    getCategoryOptionsForFascia,
    isCategoryAllowedForFascia,
    isFeGeneralTaskLimitRule,
    requisitionLimitRuleCategories,
    requisitionLimitRuleFascias,
} from "./requisition-limit-rule-options";

type FormValues = {
    category: RequisitionLimitRuleCategory | "";
    fascia: RequisitionLimitRuleFascia | "";
    feTaskTypeId: string | null;
    maxQuantity: number;
    maxRate: number;
};

const feTaskTypeValidationMessage =
    "FeTaskTypeId is required only for FE GeneralTask and must be null for other categories.";

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
        fascia: z
            .union([z.literal(""), z.enum(requisitionLimitRuleFascias)])
            .refine((value) => value !== "", {
                message: "Fascia is required and must be valid.",
            }),

        category: z
            .union([z.literal(""), z.enum(requisitionLimitRuleCategories)])
            .refine((value) => value !== "", {
                message: "Category is required and must be valid.",
            }),

        feTaskTypeId: z.string().nullable(),

        maxQuantity: positiveIntegerInputSchema("Max Quantity"),
        maxRate: positiveMoneyInputSchema("Max Rate"),
    })
    .superRefine((data, ctx) => {
        if (
            data.fascia &&
            data.category &&
            !isCategoryAllowedForFascia(data.fascia, data.category)
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["category"],
                message: "Category is not supported for the selected fascia.",
            });
        }

        const isFeGeneralTask = isFeGeneralTaskLimitRule(
            data.fascia,
            data.category,
        );

        if (isFeGeneralTask && !data.feTaskTypeId) {
            ctx.addIssue({
                code: "custom",
                path: ["feTaskTypeId"],
                message: feTaskTypeValidationMessage,
            });
        }

        if (!isFeGeneralTask && data.feTaskTypeId) {
            ctx.addIssue({
                code: "custom",
                path: ["feTaskTypeId"],
                message: feTaskTypeValidationMessage,
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

export function RequisitionLimitRuleFormModal(props: Readonly<Props>) {
    if (!props.open) {
        return null;
    }

    return (
        <RequisitionLimitRuleFormModalContent
            key={props.initial?.id ?? "new"}
            {...props}
        />
    );
}

function RequisitionLimitRuleFormModalContent({
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
        control,
        setValue,
        formState: { isSubmitting, errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            fascia: initial?.fascia ?? "",
            category: initial?.category ?? "",
            feTaskTypeId: initial?.feTaskTypeId ?? null,
            maxQuantity: initial?.maxQuantity ?? 0,
            maxRate: initial?.maxRate ?? 0,
        },
    });

    const fascia = useWatch({ control, name: "fascia" });
    const category = useWatch({ control, name: "category" });

    const availableCategoryOptions = useMemo(
        () => getCategoryOptionsForFascia(fascia),
        [fascia],
    );

    const isFeGeneralTask = isFeGeneralTaskLimitRule(fascia, category);
    const maxRateLabel =
        category === "VanPack" ? "Fixed Van Pack Price (£)" : "Max Rate (£)";

    const fasciaRegistration = register("fascia", {
        onChange: (event) => {
            const nextFascia = event.target.value as
                | RequisitionLimitRuleFascia
                | "";

            if (!nextFascia) {
                setValue("category", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                });
                setValue("feTaskTypeId", null, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
                return;
            }

            if (
                category &&
                !isCategoryAllowedForFascia(nextFascia, category)
            ) {
                setValue("category", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                });
                setValue("feTaskTypeId", null, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
                return;
            }

            if (!isFeGeneralTaskLimitRule(nextFascia, category)) {
                setValue("feTaskTypeId", null, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
        },
    });

    const categoryRegistration = register("category", {
        onChange: (event) => {
            const nextCategory = event.target.value as
                | RequisitionLimitRuleCategory
                | "";

            if (!isFeGeneralTaskLimitRule(fascia, nextCategory)) {
                setValue("feTaskTypeId", null, {
                    shouldDirty: true,
                    shouldValidate: true,
                });
            }
        },
    });

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
        isFeGeneralTask &&
        isEditing &&
        Boolean(initial?.feTaskTypeId) &&
        selectedTaskType?.isActive === false;

    function handleClose() {
        onClose();
    }

    async function onValid(data: FormValues) {
        if (!data.category || !data.fascia) {
            return;
        }

        try {
            await onSubmit({
                category: data.category,
                fascia: data.fascia,
                feTaskTypeId: isFeGeneralTaskLimitRule(
                    data.fascia,
                    data.category,
                )
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
            onClose={handleClose}
            title={isEditing ? "Edit Limit Rule" : "Create Limit Rule"}
        >
            <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-5">
                <AdminFormServerError message={serverError} />

                <Field label="Fascia" required error={errors.fascia?.message}>
                    <select className={fieldBase} {...fasciaRegistration}>
                        <option value="">Select fascia</option>

                        {fasciaOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Category" required error={errors.category?.message}>
                    <select
                        className={fieldBase}
                        disabled={!fascia}
                        {...categoryRegistration}
                    >
                        <option value="">
                            {fascia ? "Select category" : "Select fascia first"}
                        </option>

                        {availableCategoryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </Field>

                {isFeGeneralTask && (
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
                                    {taskType.isActive
                                        ? taskType.name
                                        : `${taskType.name} (Inactive)`}
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

                <AdminModalFormActions
                    isEditing={isEditing}
                    isSubmitting={isSubmitting}
                    onCancel={handleClose}
                />
            </form>
        </Modal>
    );
}