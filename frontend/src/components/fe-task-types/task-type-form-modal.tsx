"use client";

import { useCallback, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeTaskType } from "@/lib/api/fe-task-types";

type TaskTypeFormModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; code: string }) => Promise<void>;
    initial?: FeTaskType | null;
};

type FieldErrors = Partial<Record<"name" | "code", string>>;

function validate(name: string, code: string): FieldErrors {
    const errors: FieldErrors = {};

    if (!name.trim()) {
        errors.name = "Name is required.";
    } else if (name.trim().length > 100) {
        errors.name = "Name must be between 1 and 100 characters.";
    }

    if (!code.trim()) {
        errors.code = "Code is required.";
    } else if (code.trim().length > 20) {
        errors.code = "Code must be between 1 and 20 characters.";
    } else if (!/^[A-Z0-9_-]+$/.test(code.trim())) {
        errors.code =
            "Code must contain only uppercase letters, numbers, hyphens, and underscores.";
    }

    return errors;
}

function getSubmitLabel(isEditing: boolean): string {
    return isEditing ? "Save Changes" : "Create";
}

export function TaskTypeFormModal({
    open,
    onClose,
    onSubmit,
    initial,
}: Readonly<TaskTypeFormModalProps>) {
    const isEditing = !!initial;

    const [name, setName] = useState(initial?.name ?? "");
    const [code, setCode] = useState(initial?.code ?? "");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Reset form when modal opens with new data
    const handleClose = useCallback(() => {
        setName(initial?.name ?? "");
        setCode(initial?.code ?? "");
        setErrors({});
        setServerError(null);
        onClose();
    }, [initial, onClose]);

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setServerError(null);

        const fieldErrors = validate(name, code);
        setErrors(fieldErrors);

        if (Object.keys(fieldErrors).length > 0) return;

        setSubmitting(true);
        try {
            await onSubmit({ name: name.trim(), code: code.trim() });
            handleClose();
        } catch (err: unknown) {
            const apiErr = err as {
                detail?: string;
                errors?: Record<string, string[]>;
            };
            if (apiErr.errors) {
                const mapped: FieldErrors = {};
                for (const [key, msgs] of Object.entries(apiErr.errors)) {
                    const field = key.toLowerCase() as keyof FieldErrors;
                    if (field === "name" || field === "code") {
                        mapped[field] = msgs[0];
                    }
                }
                setErrors(mapped);
            } else {
                setServerError(
                    apiErr.detail ?? "Something went wrong. Please try again.",
                );
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEditing ? "Edit Task Type" : "New Task Type"}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {serverError && (
                    <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600">
                        {serverError}
                    </div>
                )}

                {/* Name field */}
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Code field */}
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
                        value={code}
                        onChange={(e) =>
                            setCode(e.target.value.toUpperCase())
                        }
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
                            {errors.code}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                        Uppercase letters, numbers, hyphens, and underscores
                        only.
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
                    <Button type="submit" disabled={submitting}>
                        {submitting
                            ? "Saving..."
                            : getSubmitLabel(isEditing)}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
