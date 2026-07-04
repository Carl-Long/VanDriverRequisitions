"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AdminFormServerError } from "@/features/admin-shared/admin-form-server-error";
import { AdminModalFormActions } from "@/features/admin-shared/admin-modal-form-actions";
import {
    Combobox,
    type ComboboxOption,
} from "@/components/ui/field/combobox";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { Modal } from "@/components/ui/modal";
import type { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { InactiveLookupWarning } from "@/features/requisitions-shared/components/inactive-lookup-warning";
import type {
    RequisitionLimitRuleCategory,
    RequisitionLimitRuleFascia,
    RequisitionLimitRuleSummary,
} from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { getApiErrorMessage } from "@/lib/api/client";
import { hasMaxTwoDecimalPlaces, MIN_MONEY_AMOUNT } from "@/lib/validation/money";

import {
    categoryOptions,
    fasciaOptions,
    getCategoryOptionsForFascia,
    isAllowedCategoryForFascia,
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
        const isFeGeneralTask =
            data.fascia === "Fe" && data.category === "GeneralTask";

        if (isFeGeneralTask && !data.feTaskTypeId) {
            ctx.addIssue({
                code: "custom",
                path: ["feTaskTypeId"],
                message:
                    "FeTaskTypeId is required only for GeneralTask and must be null for other categories.",
            });
        }

        if (!isFeGeneralTask && data.feTaskTypeId) {
            ctx.addIssue({
                code: "custom",
                path: ["feTaskTypeId"],
                message:
                    "FeTaskTypeId is required only for GeneralTask and must be null for other categories.",
            });
        }

        if (
            data.fascia === "Fe" &&
            data.category &&
            !isAllowedCategoryForFascia(data.fascia, data.category)
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["category"],
                message: "Category is not valid for FE requisitions.",
            });
        }

        if (
            data.fascia === "Std" &&
            data.category &&
            !isAllowedCategoryForFascia(data.fascia, data.category)
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["category"],
                message: "Category is not valid for STD requisitions.",
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
            category: initial?.category ?? "",
            fascia: initial?.fascia ?? "",
            feTaskTypeId: initial?.feTaskTypeId ?? null,
            maxQuantity: initial?.maxQuantity ?? 0,
            maxRate: initial?.maxRate ?? 0,
        },
    });

    const category = useWatch({ control, name: "category" });
    const fascia = useWatch({ control, name: "fascia" });
    const feTaskTypeId = useWatch({ control, name: "feTaskTypeId" });

    const isFeGeneralTask = fascia === "Fe" && category === "GeneralTask";
    const maxRateLabel = category === "VanPack" ? "Fixed Van Pack Price (£)" : "Max Rate (£)";

    const availableCategoryOptions = useMemo(
        () => getCategoryOptionsForFascia(fascia),
        [fascia],
    );

    const visibleTaskTypes = useMemo(
        () =>
            taskTypes.filter(
                (taskType) =>
                    taskType.isActive ||
                    (isEditing && taskType.id === initial?.feTaskTypeId),
            ),
        [taskTypes, isEditing, initial?.feTaskTypeId],
    );

    const taskTypeOptions = useMemo<ComboboxOption[]>(
        () =>
            visibleTaskTypes.map((taskType) => ({
                value: taskType.id,
                label: taskType.isActive
                    ? taskType.name
                    : `${taskType.name} (Inactive)`,
            })),
        [visibleTaskTypes],
    );

    const selectedFasciaLabel = fasciaOptions.find((option) => option.value === fascia)?.label ?? null;
    const selectedCategoryLabel = categoryOptions.find((option) => option.value === category)?.label ?? null;
    const selectedTaskTypeLabel = taskTypeOptions.find((option) => option.value === feTaskTypeId)?.label ?? null;

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

    function handleFasciaChange(value: string | null) {
        const nextFascia = value ? (value as RequisitionLimitRuleFascia) : "";

        setValue("fascia", nextFascia, {
            shouldDirty: true,
            shouldValidate: true,
        });

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

        if (category && !isAllowedCategoryForFascia(nextFascia, category)) {
            setValue("category", "", {
                shouldDirty: true,
                shouldValidate: true,
            });

            setValue("feTaskTypeId", null, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }

        if (nextFascia !== "Fe") {
            setValue("feTaskTypeId", null, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }

    function handleCategoryChange(value: string | null) {
        const nextCategory = value
            ? (value as RequisitionLimitRuleCategory)
            : "";

        setValue("category", nextCategory, {
            shouldDirty: true,
            shouldValidate: true,
        });

        if (nextCategory !== "GeneralTask") {
            setValue("feTaskTypeId", null, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }

    function handleTaskTypeChange(value: string | null) {
        setValue("feTaskTypeId", value || null, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }

    async function onValid(data: FormValues) {
        if (!data.category || !data.fascia) {
            return;
        }

        try {
            await onSubmit({
                category: data.category,
                fascia: data.fascia,
                feTaskTypeId:
                    data.fascia === "Fe" && data.category === "GeneralTask"
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
            <form
                onSubmit={handleSubmit(onValid)}
                noValidate
                className="space-y-5"
            >
                <AdminFormServerError message={serverError} />

                <Field label="Fascia" required error={errors.fascia?.message}>
                    <Combobox
                        value={fascia}
                        label={selectedFasciaLabel}
                        options={[...fasciaOptions]}
                        searchable={false}
                        placeholder="Select fascia"
                        emptyStateText="No fascias available"
                        noMatchesText="No matching fascia found"
                        state={errors.fascia ? "error" : "default"}
                        onChange={handleFasciaChange}
                    />
                </Field>

                <Field
                    label="Category"
                    required
                    error={errors.category?.message}
                >
                    <Combobox
                        value={category}
                        label={selectedCategoryLabel}
                        options={availableCategoryOptions}
                        searchable={false}
                        placeholder={
                            fascia
                                ? "Select category"
                                : "Select fascia first"
                        }
                        emptyStateText={
                            fascia
                                ? "No categories available"
                                : "Select a fascia first"
                        }
                        noMatchesText="No matching category found"
                        state={errors.category ? "error" : "default"}
                        disabled={!fascia}
                        onChange={handleCategoryChange}
                    />
                </Field>

                {isFeGeneralTask && (
                    <Field
                        label="Task Type"
                        error={errors.feTaskTypeId?.message}
                    >
                        <Combobox
                            value={feTaskTypeId}
                            label={selectedTaskTypeLabel}
                            options={taskTypeOptions}
                            placeholder="Select task type"
                            emptyStateText="No task types available"
                            noMatchesText="No matching task type found"
                            state={errors.feTaskTypeId ? "error" : "default"}
                            onChange={handleTaskTypeChange}
                        />

                        {showInactiveTaskTypeWarning && (
                            <InactiveLookupWarning
                                label="task type"
                                variant="field"
                            />
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