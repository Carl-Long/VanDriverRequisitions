"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/field/input";
import { Field } from "@/components/ui/field/field";

import type { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";

const taskTypeSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required.")
        .max(100, "Name must be between 1 and 100 characters."),

    code: z
        .string()
        .trim()
        .transform((v) => v.toUpperCase())
        .pipe(
            z
                .string()
                .regex(
                    /^[A-Z0-9_-]+$/,
                    "Code must contain only uppercase letters, numbers, hyphens, and underscores.",
                ),
        ),
});

type TaskTypeFormData = z.infer<typeof taskTypeSchema>;

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TaskTypeFormData) => Promise<void>;
    initial?: FeTaskType | null;
};

export function TaskTypeFormModal({ open, onClose, onSubmit, initial }: Readonly<Props>) {
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

    function applyApiErrors(error: ApiError) {
        if (!error.errors) {
            setServerError(error.message ?? "Something went wrong.");
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
        } catch (err) {
            if (err instanceof ApiError) {
                applyApiErrors(err);
                return;
            }

            setServerError("Unexpected error occurred.");
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEditing ? "Edit Task Type" : "Create Task Type"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                {serverError && <Alert tone="danger">{serverError}</Alert>}

                <Field label="Name" error={errors.name?.message} required>
                    <Input
                        {...register("name")}
                        state={errors.name ? "error" : "default"}
                        placeholder="e.g. Collections"
                    />
                </Field>

                {/* Code */}
                <Field
                    label="Code"
                    error={errors.code?.message}
                    hint="Uppercase letters, numbers, hyphens, and underscores only."
                    required
                >
                    <Input
                        {...register("code")}
                        onChange={(e) => {
                            setValue("code", e.target.value.toUpperCase(), {
                                shouldValidate: true,
                                shouldDirty: true,
                            });
                        }}
                        state={errors.code ? "error" : "default"}
                        placeholder="e.g. COLLECTIONS"
                    />
                </Field>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        tone="primary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button type="submit" loading={isSubmitting} tone="primary">
                        {isEditing ? "Save Changes" : "Create"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
