"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/field/input";
import { Field } from "@/components/ui/field/field";

import type { FeReason } from "@/features/fe-reasons/fe-reasons-api";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/components/ui/alert";

const reasonSchema = z.object({
    reason: z
        .string()
        .trim()
        .min(1, "Reason is required.")
        .max(100, "Reason must be between 1 and 100 characters."),
});

type ReasonFormData = z.infer<typeof reasonSchema>;

type ReasonFormModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ReasonFormData) => Promise<void>;
    initial?: FeReason | null;
};

export function ReasonFormModal({
    open,
    onClose,
    onSubmit,
    initial,
}: Readonly<ReasonFormModalProps>) {
    const isEditing = !!initial;
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ReasonFormData>({
        resolver: zodResolver(reasonSchema),
        defaultValues: {
            reason: "",
        },
    });

    useEffect(() => {
        if (!open) return;

        reset({
            reason: initial?.reason ?? "",
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
            setServerError(error.message ?? "Something went wrong.");
            return;
        }

        if (error.errors.Reason?.[0]) {
            setError("reason", {
                message: error.errors.Reason[0],
            });
        }
    }

    async function onValid(data: ReasonFormData) {
        setServerError(null);

        try {
            await onSubmit(data);
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
            title={isEditing ? "Edit Reason" : "Create Reason"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                {/* Server error */}
                {serverError && <Alert tone="danger">{serverError}</Alert>}

                {/* Reason */}
                <Field label="Reason" error={errors.reason?.message} required>
                    <Input
                        {...register("reason")}
                        maxLength={100}
                        placeholder="e.g. Toll fee"
                        state={errors.reason ? "error" : "default"}
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
