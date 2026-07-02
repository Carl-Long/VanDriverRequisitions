"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/field/input";
import { Field } from "@/components/ui/field/field";

import type { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { ApiError } from "@/lib/api/client";
import { AdminFormServerError } from "../admin-shared/admin-form-server-error";
import { AdminModalFormActions } from "../admin-shared/admin-modal-form-actions";

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
        .regex(/^\d+$/, "Code must contain numbers only."),
});

type TaskTypeFormData = z.infer<typeof taskTypeSchema>;

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: TaskTypeFormData) => Promise<void>;
    initial?: FeTaskType | null;
};

export function TaskTypeFormModal(props: Readonly<Props>) {
    if (!props.open) {
        return null;
    }

    return (
        <TaskTypeFormModalContent
            key={props.initial?.id ?? "new"}
            {...props}
        />
    );
}

function TaskTypeFormModalContent({
    open,
    onClose,
    onSubmit,
    initial,
}: Readonly<Props>) {
    const isEditing = !!initial;
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<TaskTypeFormData>({
        resolver: zodResolver(taskTypeSchema),
        defaultValues: {
            name: initial?.name ?? "",
            code: initial?.code ?? "",
        },
    });


    function handleClose() {
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

                <AdminFormServerError message={serverError} />

                <Field label="Name" error={errors.name?.message} required>
                    <Input
                        {...register("name")}
                        state={errors.name ? "error" : "default"}
                        placeholder="e.g. Collections"
                    />
                </Field>

                <Field
                    label="Code"
                    error={errors.code?.message}
                    hint="Numbers only."
                    required
                >
                    <Input
                        {...register("code")}
                        state={errors.code ? "error" : "default"}
                        placeholder="e.g. 23707"
                    />
                </Field>

                <AdminModalFormActions
                    isEditing={isEditing}
                    isSubmitting={isSubmitting}
                    onCancel={handleClose}
                />
            </form>
        </Modal>
    );
}
