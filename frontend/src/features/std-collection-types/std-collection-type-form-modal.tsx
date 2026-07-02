"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api/client";
import type { StdCollectionType } from "@/features/std-collection-types/std-collection-types-api";
import { AdminFormServerError } from "../admin-shared/admin-form-server-error";
import { AdminModalFormActions } from "../admin-shared/admin-modal-form-actions";

const stdCollectionTypeSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Code is required.")
        .max(20, "Code must be between 1 and 20 characters.")
        .regex(/^\d+$/, "Code must contain numbers only."),

    name: z
        .string()
        .trim()
        .min(1, "Name is required.")
        .max(100, "Name must be between 1 and 100 characters."),
});

type StdCollectionTypeFormData = z.infer<typeof stdCollectionTypeSchema>;

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: StdCollectionTypeFormData) => Promise<void>;
    initial?: StdCollectionType | null;
};

export function StdCollectionTypeFormModal(props: Readonly<Props>) {
    if (!props.open) {
        return null;
    }

    return (
        <StdCollectionTypeFormModalContent
            key={props.initial?.id ?? "new"}
            {...props}
        />
    );
}

function StdCollectionTypeFormModalContent({
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
    } = useForm<StdCollectionTypeFormData>({
        resolver: zodResolver(stdCollectionTypeSchema),
        defaultValues: {
            code: initial?.code ?? "",
            name: initial?.name ?? "",
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

        if (error.errors.Code?.[0]) {
            setError("code", { message: error.errors.Code[0] });
        }

        if (error.errors.Name?.[0]) {
            setError("name", { message: error.errors.Name[0] });
        }
    }

    async function onValid(data: StdCollectionTypeFormData) {
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
            title={isEditing ? "Edit STD Collection Type" : "Create STD Collection Type"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">

                <AdminFormServerError message={serverError} />

                <Field
                    label="Code"
                    error={errors.code?.message}
                    hint="Numbers only, e.g. 27013."
                    required
                >
                    <Input
                        {...register("code")}
                        maxLength={20}
                        placeholder="e.g. 27013"
                        state={errors.code ? "error" : "default"}
                    />
                </Field>

                <Field label="Name" error={errors.name?.message} required>
                    <Input
                        {...register("name")}
                        maxLength={100}
                        placeholder="e.g. Book Banks"
                        state={errors.name ? "error" : "default"}
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