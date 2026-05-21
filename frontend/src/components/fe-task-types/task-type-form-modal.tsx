"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import type { FeTaskType } from "@/lib/api/fe-task-types";
import { limitValuesApi, type LimitValue } from "@/lib/api/limit-values";

// Zod schema — mirrors backend FluentValidation rules exactly
const taskTypeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required.")
        .max(100, "Name must be between 1 and 100 characters."),
    code: z
        .string()
        .trim()
        .min(1, "Code is required.")
        .max(20, "Code must be between 1 and 20 characters.")
        .regex(
            /^[A-Z0-9_-]+$/,
            "Code must contain only uppercase letters, numbers, hyphens, and underscores.",
        ),
    dailyQuantityLimitId: z.string().nullable(),
    rateLimitId: z.string().nullable(),
});

type TaskTypeFormData = z.infer<typeof taskTypeSchema>;

type TaskTypeFormModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TaskTypeFormData) => Promise<void>;
    initial?: FeTaskType | null;
};

export function TaskTypeFormModal({
    open,
    onClose,
    onSubmit,
    initial,
}: Readonly<TaskTypeFormModalProps>) {
    const isEditing = !!initial;
    const [serverError, setServerError] = useState<string | null>(null);
    const [numericalLimits, setNumericalLimits] = useState<LimitValue[]>([]);
    const [currencyLimits, setCurrencyLimits] = useState<LimitValue[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TaskTypeFormData>({
        resolver: zodResolver(taskTypeSchema),
        defaultValues: {
            name: initial?.name ?? "",
            code: initial?.code ?? "",
            dailyQuantityLimitId: initial?.dailyQuantityLimitId ?? null,
            rateLimitId: initial?.rateLimitId ?? null,
        },
    });

    // Load limits and reset form when modal opens
    useEffect(() => {
        if (open) {
            limitValuesApi.getAll(false).then((all) => {
                setNumericalLimits(all.filter((lv) => lv.numericalLimit !== null));
                setCurrencyLimits(all.filter((lv) => lv.currencyLimit !== null));

                // Reset form after limits are loaded
                reset({
                    name: initial?.name ?? "",
                    code: initial?.code ?? "",
                    dailyQuantityLimitId: initial?.dailyQuantityLimitId ?? null,
                    rateLimitId: initial?.rateLimitId ?? null,
                });
                setServerError(null);
            }).catch(() => {
                /* silently degrade — limits are optional */
                reset({
                    name: initial?.name ?? "",
                    code: initial?.code ?? "",
                    dailyQuantityLimitId: initial?.dailyQuantityLimitId ?? null,
                    rateLimitId: initial?.rateLimitId ?? null,
                });
                setServerError(null);
            });
        }
    }, [open, initial, reset]);

    function handleClose() {
        reset();
        setServerError(null);
        onClose();
    }

    async function onValid(data: TaskTypeFormData) {
        setServerError(null);
        try {
            await onSubmit(data);
            handleClose();
        } catch (err: unknown) {
            const apiErr = err as {
                detail?: string;
                errors?: Record<string, string[]>;
            };
            if (apiErr.errors) {
                for (const [key, msgs] of Object.entries(apiErr.errors)) {
                    const field = key.toLowerCase();
                    if (field === "name" || field === "code") {
                        setError(field, { message: msgs[0] });
                    }
                }
            } else {
                setServerError(
                    apiErr.detail ?? "Something went wrong. Please try again.",
                );
            }
        }
    }

    const selectClass = cn(
        "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring/20",
        "transition-colors border-border focus:border-primary/30",
    );

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEditing ? "Edit Task Type" : "New Task Type"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                {serverError && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                        {serverError}
                    </div>
                )}

                {/* Name field */}
                <div>
                    <label
                        htmlFor="name"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register("name")}
                        maxLength={100}
                        className={cn(
                            "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
                            "placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-ring/20",
                            "transition-colors",
                            errors.name
                                ? "border-red-500 focus:border-red-500"
                                : "border-border focus:border-primary/30",
                        )}
                        placeholder="e.g. Standard Delivery"
                    />
                    {errors.name && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Code field */}
                <div>
                    <label
                        htmlFor="code"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Code
                    </label>
                    <input
                        id="code"
                        type="text"
                        {...register("code", {
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                                setValue("code", e.target.value.toUpperCase(), {
                                    shouldValidate: false,
                                }),
                        })}
                        maxLength={20}
                        className={cn(
                            "w-full rounded-lg border bg-surface px-3 py-2 font-mono text-sm text-foreground",
                            "placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-ring/20",
                            "transition-colors",
                            errors.code
                                ? "border-red-500 focus:border-red-500"
                                : "border-border focus:border-primary/30",
                        )}
                        placeholder="e.g. STD_DELIVERY"
                    />
                    {errors.code && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.code.message}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                        Uppercase letters, numbers, hyphens, and underscores
                        only.
                    </p>
                </div>

                {/* Limits */}
                <div>
                    <label
                        htmlFor="dailyQuantityLimitId"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Daily Qty Limit
                    </label>
                    <select
                        id="dailyQuantityLimitId"
                        {...register("dailyQuantityLimitId", {
                            setValueAs: (v) => (v === "" ? null : v),
                        })}
                        className={selectClass}
                    >
                        <option value="">None</option>
                        {numericalLimits.map((lv) => (
                            <option key={lv.id} value={lv.id}>
                                {lv.title} ({lv.numericalLimit})
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Max value per day (Sun–Sat).
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="rateLimitId"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Rate Limit
                    </label>
                    <select
                        id="rateLimitId"
                        {...register("rateLimitId", {
                            setValueAs: (v) => (v === "" ? null : v),
                        })}
                        className={selectClass}
                    >
                        <option value="">None</option>
                        {currencyLimits.map((lv) => (
                            <option key={lv.id} value={lv.id}>
                                {lv.title} (£{lv.currencyLimit?.toFixed(2)})
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Max rate per job.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
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
