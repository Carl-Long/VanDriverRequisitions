"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import type { SubmitWindow } from "@/lib/api/submit-windows";
import { toLocalInput, toUtcIso } from "@/lib/format/date";

// Zod schema — mirrors backend FluentValidation rules
const submitWindowSchema = z
    .object({
        openFrom: z.string().min(1, "Open from date is required."),
        openTo: z.string().min(1, "Open to date is required."),
    })
    .refine(
        (data) => {
            const from = new Date(data.openFrom);
            const to = new Date(data.openTo);
            return to > from;
        },
        {
            message: "Open to date must be after the open from date.",
            path: ["openTo"],
        },
    );

// Separate schema for create that also enforces future dates
const createSubmitWindowSchema = z
    .object({
        openFrom: z
            .string()
            .min(1, "Open from date is required.")
            .refine(
                (val) => new Date(val) > new Date(),
                "Open from date must be in the future.",
            ),
        openTo: z.string().min(1, "Open to date is required."),
    })
    .refine(
        (data) => {
            const from = new Date(data.openFrom);
            const to = new Date(data.openTo);
            return to > from;
        },
        {
            message: "Open to date must be after the open from date.",
            path: ["openTo"],
        },
    );

type SubmitWindowFormData = z.infer<typeof submitWindowSchema>;

type SubmitWindowFormModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { openFrom: string; openTo: string }) => Promise<void>;
    initial?: SubmitWindow | null;
};

export function SubmitWindowFormModal({
    open,
    onClose,
    onSubmit,
    initial,
}: Readonly<SubmitWindowFormModalProps>) {
    const isEditing = !!initial;
    const [serverError, setServerError] = useState<string | null>(null);

    const schema = isEditing ? submitWindowSchema : createSubmitWindowSchema;

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<SubmitWindowFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            openFrom: initial ? toLocalInput(initial.openFrom) : "",
            openTo: initial ? toLocalInput(initial.openTo) : "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                openFrom: initial ? toLocalInput(initial.openFrom) : "",
                openTo: initial ? toLocalInput(initial.openTo) : "",
            });
            setServerError(null);
        }
    }, [open, initial, reset]);

    function handleClose() {
        reset();
        setServerError(null);
        onClose();
    }

    function mapServerErrors(apiErr: {
        detail?: string;
        errors?: Record<string, string[]>;
    }) {
        if (apiErr.errors) {
            for (const [key, msgs] of Object.entries(apiErr.errors)) {
                const field = key.toLowerCase();
                if (field === "openfrom") setError("openFrom", { message: msgs[0] });
                if (field === "opento") setError("openTo", { message: msgs[0] });
            }
        } else {
            setServerError(
                apiErr.detail ?? "Something went wrong. Please try again.",
            );
        }
    }

    async function onValid(data: SubmitWindowFormData) {
        setServerError(null);
        try {
            await onSubmit({
                openFrom: toUtcIso(data.openFrom),
                openTo: toUtcIso(data.openTo),
            });
            handleClose();
        } catch (err) {
            mapServerErrors(
                err as { detail?: string; errors?: Record<string, string[]> },
            );
        }
    }

    const inputClass = (hasError: boolean) =>
        cn(
            "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring/20",
            "transition-colors",
            hasError
                ? "border-red-500 focus:border-red-500"
                : "border-border focus:border-primary/30",
        );

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEditing ? "Edit Submit Window" : "New Submit Window"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                {serverError && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                        {serverError}
                    </div>
                )}

                <div>
                    <label
                        htmlFor="openFrom"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Open From
                    </label>
                    <input
                        id="openFrom"
                        type="datetime-local"
                        {...register("openFrom")}
                        className={inputClass(!!errors.openFrom)}
                    />
                    {errors.openFrom && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.openFrom.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="openTo"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Open To
                    </label>
                    <input
                        id="openTo"
                        type="datetime-local"
                        {...register("openTo")}
                        className={inputClass(!!errors.openTo)}
                    />
                    {errors.openTo && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.openTo.message}
                        </p>
                    )}
                </div>

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
