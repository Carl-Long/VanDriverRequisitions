"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";

import { cn } from "@/lib/utils";

import type { FeTaskType } from "@/lib/api/fe-task-types";
import { ApiError } from "@/lib/api/client";

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

    const [serverError, setServerError] =
        useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        setValue,

        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<TaskTypeFormData>({
        resolver: zodResolver(taskTypeSchema),

        defaultValues: {
            name: "",
            code: "",
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        reset({
            name: initial?.name ?? "",
            code: initial?.code ?? "",
        });

        setServerError(null);
    }, [open, initial, reset]);

    function handleClose() {
        reset();

        setServerError(null);

        onClose();
    }

    function applyApiValidationErrors(error: ApiError) {
        if (!error.errors) {
            setServerError(
                error.detail ??
                error.message ??
                "Something went wrong.",
            );

            return;
        }

        if (error.errors.Name?.[0]) {
            setError("name", {
                message: error.errors.Name[0],
            });
        }

        if (error.errors.Code?.[0]) {
            setError("code", {
                message: error.errors.Code[0],
            });
        }
    }

    async function onValid(data: TaskTypeFormData) {
        setServerError(null);

        try {
            await onSubmit(data);

            handleClose();
        } catch (err) {
            if (err instanceof ApiError) {
                applyApiValidationErrors(err);
                return;
            }

            setServerError("Unexpected error occurred.");
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={
                isEditing
                    ? "Edit Task Type"
                    : "New Task Type"
            }
        >
            <form
                onSubmit={handleSubmit(onValid)}
                className="space-y-5"
            >
                {serverError && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                        {serverError}
                    </div>
                )}

                {/* Name */}
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

                {/* Code */}
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
                            onChange: (
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                                setValue(
                                    "code",
                                    e.target.value.toUpperCase(),
                                    {
                                        shouldValidate: false,
                                    },
                                ),
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
                        Uppercase letters, numbers,
                        hyphens, and underscores only.
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

                    <Button
                        type="submit"
                        loading={isSubmitting}
                    >
                        {isEditing
                            ? "Save Changes"
                            : "Create"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}