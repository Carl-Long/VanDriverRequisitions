"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { fieldBase } from "@/components/ui/field/fieldstyles";

import { cn } from "@/lib/utils";

import type { FeReason } from "@/lib/api/fe-reasons";
import { ApiError } from "@/lib/api/client";

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
            setServerError(
                error.detail ??
                error.message ??
                "Something went wrong."
            );

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
            title={isEditing ? "Edit Reason" : "New Reason"}
        >
            <form
                onSubmit={handleSubmit(onValid)}
                className="space-y-5"
            >
                {serverError && (
                    <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                        {serverError}
                    </div>
                )}

                {/* Reason */}
                <div>
                    <label
                        htmlFor="reason"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Reason
                    </label>

                    <input
                        id="reason"
                        {...register("reason")}
                        maxLength={100}
                        className={inputClass(!!errors.reason)}
                        placeholder="e.g. Toll fee"
                    />

                    {errors.reason && (
                        <p className="mt-1 text-xs text-danger">
                            {errors.reason.message}
                        </p>
                    )}
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
                        {isEditing ? "Save Changes" : "Create"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}