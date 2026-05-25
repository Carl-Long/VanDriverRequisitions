"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import { fieldBase } from "@/components/ui/field/fieldstyles";

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
            "Code must contain only uppercase letters, numbers, hyphens, and underscores."
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

    const [serverError, setServerError] = useState<string | null>(null);

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
            name: "",
            code: "",
        },
    });

    useEffect(() => {
        if (!open) return;

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
            setServerError(error.detail ?? error.message ?? "Something went wrong.");
            return;
        }

        if (error.errors.Name?.[0]) {
            setError("name", { message: error.errors.Name[0] });
        }

        if (error.errors.Code?.[0]) {
            setError("code", { message: error.errors.Code[0] });
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

    const inputClass = (hasError?: boolean) =>
        cn(
            fieldBase,
            hasError
                ? "border-danger focus-visible:ring-danger/20"
                : "focus-visible:ring-primary/20"
        );

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEditing ? "Edit Task Type" : "Create Task Type"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                {serverError && (
                    <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
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
                        className={inputClass(!!errors.name)}
                        placeholder="e.g. Collections"
                    />

                    {errors.name && (
                        <p className="mt-1 text-xs text-danger">
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
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                                setValue("code", e.target.value.toUpperCase(), {
                                    shouldValidate: false,
                                }),
                        })}
                        maxLength={20}
                        className={inputClass(!!errors.code)}
                        placeholder="e.g 20000"
                    />

                    {errors.code && (
                        <p className="mt-1 text-xs text-danger">
                            {errors.code.message}
                        </p>
                    )}

                    <p className="mt-1 text-xs text-muted-foreground">
                        Uppercase letters, numbers, hyphens, and underscores only.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        style="outline"
                        tone="primary"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        style="solid"
                        tone="primary"
                        loading={isSubmitting}
                    >
                        {isEditing ? "Save Changes" : "Create"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}