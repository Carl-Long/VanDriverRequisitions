"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import {
    type LimitValue,
    Fascia,
    LimitationType,
} from "@/lib/api/limit-values";

const limitValueSchema = z
    .object({
        title: z
            .string()
            .trim()
            .min(1, "Title is required.")
            .max(100, "Title must be between 1 and 100 characters."),
        nameOfValue: z
            .string()
            .trim()
            .min(1, "Name of value is required.")
            .max(100, "Name of value must be between 1 and 100 characters."),
        fascia: z.number().nullable(),
        typeOfLimitation: z.number(),
        valueType: z.enum(["numerical", "currency"]),
        numericalLimit: z.coerce
            .number({ invalid_type_error: "Must be a number." })
            .int("Must be a whole number.")
            .min(0, "Must be zero or greater.")
            .nullable()
            .optional(),
        currencyLimit: z.coerce
            .number({ invalid_type_error: "Must be a number." })
            .min(0, "Must be zero or greater.")
            .nullable()
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (data.valueType === "numerical" && (data.numericalLimit === null || data.numericalLimit === undefined)) {
            ctx.addIssue({
                code: "custom",
                message: "Numerical limit is required.",
                path: ["numericalLimit"],
            });
        }
        if (data.valueType === "currency" && (data.currencyLimit === null || data.currencyLimit === undefined)) {
            ctx.addIssue({
                code: "custom",
                message: "Currency limit is required.",
                path: ["currencyLimit"],
            });
        }
    });

type LimitValueFormData = z.infer<typeof limitValueSchema>;

type LimitValueFormModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        nameOfValue: string;
        fascia: number | null;
        typeOfLimitation: number;
        numericalLimit: number | null;
        currencyLimit: number | null;
    }) => Promise<void>;
    initial?: LimitValue | null;
};

export function LimitValueFormModal({
    open,
    onClose,
    onSubmit,
    initial,
}: Readonly<LimitValueFormModalProps>) {
    const isEditing = !!initial;
    const [serverError, setServerError] = useState<string | null>(null);

    const defaultValueType =
        initial?.currencyLimit !== null && initial?.currencyLimit !== undefined
            ? "currency"
            : "numerical";

    const {
        register,
        handleSubmit,
        reset,
        watch,
        control,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LimitValueFormData>({
        resolver: zodResolver(limitValueSchema),
        defaultValues: {
            title: initial?.title ?? "",
            nameOfValue: initial?.nameOfValue ?? "",
            fascia: initial?.fascia ?? null,
            typeOfLimitation: initial?.typeOfLimitation ?? LimitationType.Min,
            valueType: defaultValueType,
            numericalLimit: initial?.numericalLimit ?? undefined,
            currencyLimit: initial?.currencyLimit ?? undefined,
        },
    });

    const valueType = watch("valueType");

    useEffect(() => {
        if (open) {
            const vt =
                initial?.currencyLimit !== null && initial?.currencyLimit !== undefined
                    ? "currency"
                    : "numerical";
            reset({
                title: initial?.title ?? "",
                nameOfValue: initial?.nameOfValue ?? "",
                fascia: initial?.fascia ?? null,
                typeOfLimitation: initial?.typeOfLimitation ?? LimitationType.Min,
                valueType: vt,
                numericalLimit: initial?.numericalLimit ?? undefined,
                currencyLimit: initial?.currencyLimit ?? undefined,
            });
            setServerError(null);
        }
    }, [open, initial, reset]);

    function handleClose() {
        reset();
        setServerError(null);
        onClose();
    }

    const fieldNameMap: Record<string, "title" | "nameOfValue" | "numericalLimit"> = {
        title: "title",
        nameofvalue: "nameOfValue",
        value: "numericalLimit",
    };

    function handleApiError(err: unknown) {
        const apiErr = err as { detail?: string; errors?: Record<string, string[]> };
        if (apiErr.errors) {
            for (const [key, msgs] of Object.entries(apiErr.errors)) {
                const mapped = fieldNameMap[key.toLowerCase()];
                if (mapped) {
                    setError(mapped, { message: msgs[0] });
                }
            }
        } else {
            setServerError(apiErr.detail ?? "Something went wrong. Please try again.");
        }
    }

    async function onValid(data: LimitValueFormData) {
        setServerError(null);
        try {
            await onSubmit({
                title: data.title,
                nameOfValue: data.nameOfValue,
                fascia: data.fascia,
                typeOfLimitation: data.typeOfLimitation,
                numericalLimit: data.valueType === "numerical" ? (data.numericalLimit ?? null) : null,
                currencyLimit: data.valueType === "currency" ? (data.currencyLimit ?? null) : null,
            });
            handleClose();
        } catch (err: unknown) {
            handleApiError(err);
        }
    }

    const inputClass = (hasError: boolean) =>
        cn(
            "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring/20",
            "transition-colors",
            hasError
                ? "border-red-500 focus:border-red-500"
                : "border-border focus:border-primary/30",
        );

    const selectClass = (hasError: boolean) =>
        cn(
            "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring/20",
            "transition-colors",
            hasError
                ? "border-red-500 focus:border-red-500"
                : "border-border focus:border-primary/30",
        );

    const submitLabel = isEditing ? "Save Changes" : "Create";

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEditing ? "Edit Limit Value" : "New Limit Value"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                {serverError && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                        {serverError}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label htmlFor="lv-title" className="mb-1.5 block text-sm font-medium text-foreground">
                        Title
                    </label>
                    <input
                        id="lv-title"
                        type="text"
                        {...register("title")}
                        maxLength={100}
                        className={inputClass(!!errors.title)}
                        placeholder="e.g. FE Mileage Maximum"
                    />
                    {errors.title && (
                        <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                    )}
                </div>

                {/* Name of Value */}
                <div>
                    <label htmlFor="lv-nameOfValue" className="mb-1.5 block text-sm font-medium text-foreground">
                        Name of Value
                    </label>
                    <input
                        id="lv-nameOfValue"
                        type="text"
                        {...register("nameOfValue")}
                        maxLength={100}
                        className={inputClass(!!errors.nameOfValue)}
                        placeholder="e.g. maxMileage"
                    />
                    {errors.nameOfValue && (
                        <p className="mt-1 text-xs text-red-500">{errors.nameOfValue.message}</p>
                    )}
                </div>

                {/* Fascia & Type row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="lv-fascia" className="mb-1.5 block text-sm font-medium text-foreground">
                            Fascia{" "}
                            <span className="text-xs text-muted-foreground">(optional)</span>
                        </label>
                        <Controller
                            name="fascia"
                            control={control}
                            render={({ field }) => (
                                <select
                                    id="lv-fascia"
                                    value={field.value === null ? "" : String(field.value)}
                                    onChange={(e) =>
                                        field.onChange(e.target.value === "" ? null : Number(e.target.value))
                                    }
                                    className={selectClass(!!errors.fascia)}
                                >
                                    <option value="">All</option>
                                    <option value={String(Fascia.Fe)}>FE</option>
                                    <option value={String(Fascia.Std)}>STD</option>
                                </select>
                            )}
                        />
                    </div>

                    <div>
                        <label htmlFor="lv-limitationType" className="mb-1.5 block text-sm font-medium text-foreground">
                            Limitation Type
                        </label>
                        <Controller
                            name="typeOfLimitation"
                            control={control}
                            render={({ field }) => (
                                <select
                                    id="lv-limitationType"
                                    value={String(field.value)}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className={selectClass(!!errors.typeOfLimitation)}
                                >
                                    <option value={String(LimitationType.Min)}>Min</option>
                                    <option value={String(LimitationType.Max)}>Max</option>
                                </select>
                            )}
                        />
                    </div>
                </div>

                {/* Value type toggle */}
                <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Value Type</p>
                    <Controller
                        name="valueType"
                        control={control}
                        render={({ field }) => (
                            <div className="flex rounded-lg border border-border overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => field.onChange("numerical")}
                                    className={cn(
                                        "flex-1 py-2 text-xs font-medium transition",
                                        field.value === "numerical"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-surface text-muted-foreground hover:bg-muted",
                                    )}
                                >
                                    Numerical
                                </button>
                                <button
                                    type="button"
                                    onClick={() => field.onChange("currency")}
                                    className={cn(
                                        "flex-1 py-2 text-xs font-medium transition border-l border-border",
                                        field.value === "currency"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-surface text-muted-foreground hover:bg-muted",
                                    )}
                                >
                                    Currency (£)
                                </button>
                            </div>
                        )}
                    />
                </div>

                {/* Numerical limit */}
                {valueType === "numerical" && (
                    <div>
                        <label htmlFor="lv-numericalLimit" className="mb-1.5 block text-sm font-medium text-foreground">
                            Numerical Limit
                        </label>
                        <input
                            id="lv-numericalLimit"
                            type="number"
                            min={0}
                            step={1}
                            {...register("numericalLimit")}
                            className={inputClass(!!errors.numericalLimit)}
                            placeholder="e.g. 150"
                        />
                        {errors.numericalLimit && (
                            <p className="mt-1 text-xs text-red-500">{errors.numericalLimit.message}</p>
                        )}
                    </div>
                )}

                {/* Currency limit */}
                {valueType === "currency" && (
                    <div>
                        <label htmlFor="lv-currencyLimit" className="mb-1.5 block text-sm font-medium text-foreground">
                            Currency Limit (£)
                        </label>
                        <input
                            id="lv-currencyLimit"
                            type="number"
                            min={0}
                            step={0.01}
                            {...register("currencyLimit")}
                            className={inputClass(!!errors.currencyLimit)}
                            placeholder="e.g. 250.00"
                        />
                        {errors.currencyLimit && (
                            <p className="mt-1 text-xs text-red-500">{errors.currencyLimit.message}</p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : submitLabel}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
