"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import type { FeReason } from "@/lib/api/fe-reasons";

// Zod schema — mirrors backend FluentValidation rules exactly
const reasonSchema = z.object({
    reason: z
        .string()
        .trim()
        .min(1, "Reason is required.")
        .max(200, "Reason must be between 1 and 200 characters."),
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
            reason: initial?.reason ?? "",
        },
    });

    // Reset form when modal opens with new initial data
    useEffect(() => {
        if (open) {
            reset({
                reason: initial?.reason ?? "",
            });
            setServerError(null);
        }
    }, [open, initial, reset]);

    function handleClose() {
        reset();
        setServerError(null);
        onClose();
    }

    async function onValid(data: ReasonFormData) {
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
                    if (field === "reason") {
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

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEditing ? "Edit Reason" : "New Reason"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                {serverError && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                        {serverError}
                    </div>
                )}

                {/* Reason field */}
                <div>
                    <label
                        htmlFor="reason"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Reason
                    </label>
                    <textarea
                        id="reason"
                        {...register("reason")}
                        maxLength={200}
                        rows={3}
                        className={cn(
                            "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
                            "placeholder:text-muted-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-ring/20",
                            "transition-colors resize-none",
                            errors.reason
                                ? "border-red-500 focus:border-red-500"
                                : "border-border focus:border-primary/30",
                        )}
                        placeholder="e.g. Driver was unavailable due to vehicle breakdown"
                    />
                    {errors.reason && (
                        <p className="mt-1 text-xs text-red-500">
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
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && "Saving..."}
                        {!isSubmitting && isEditing && "Save Changes"}
                        {!isSubmitting && !isEditing && "Create"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
