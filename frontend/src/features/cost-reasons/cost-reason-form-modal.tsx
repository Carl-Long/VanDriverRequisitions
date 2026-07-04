"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
    Combobox,
    type ComboboxOption,
} from "@/components/ui/field/combobox";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { Modal } from "@/components/ui/modal";
import { ApiError } from "@/lib/api/client";

import { AdminFormServerError } from "../admin-shared/admin-form-server-error";
import { AdminModalFormActions } from "../admin-shared/admin-modal-form-actions";
import { CostReason } from "./cost-reason.types";

const scopeOptions = [
    { value: "Fe", label: "FE" },
    { value: "Std", label: "STD" },
    { value: "Shared", label: "Shared" },
] as const satisfies readonly ComboboxOption[];

const costReasonSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Code is required.")
        .max(20, "Code must be between 1 and 20 characters.")
        .regex(/^\d+$/, "Code must contain numbers only."),

    reason: z
        .string()
        .trim()
        .min(1, "Reason is required.")
        .max(100, "Reason must be between 1 and 100 characters."),

    scope: z.enum(["Fe", "Std", "Shared"], {
        error: "Scope is required.",
    }),
});

type CostReasonFormData = z.infer<typeof costReasonSchema>;

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CostReasonFormData) => Promise<void>;
    initial?: CostReason | null;
};

export function CostReasonFormModal(props: Readonly<Props>) {
    if (!props.open) {
        return null;
    }

    return (
        <CostReasonFormModalContent
            key={props.initial?.id ?? "new"}
            {...props}
        />
    );
}

function CostReasonFormModalContent({
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
        control,
        setError,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CostReasonFormData>({
        resolver: zodResolver(costReasonSchema),
        defaultValues: {
            code: initial?.code ?? "",
            reason: initial?.reason ?? "",
            scope: initial?.scope ?? "Shared",
        },
    });

    const scope = useWatch({ control, name: "scope" });

    const selectedScopeLabel =
        scopeOptions.find((option) => option.value === scope)?.label ?? null;

    function handleClose() {
        onClose();
    }

    function applyApiValidationErrors(error: ApiError) {
        if (!error.errors) {
            setServerError(error.message ?? "Something went wrong.");
            return;
        }

        if (error.errors.Code?.[0]) {
            setError("code", { message: error.errors.Code[0] });
        }

        if (error.errors.Reason?.[0]) {
            setError("reason", { message: error.errors.Reason[0] });
        }

        if (error.errors.Scope?.[0]) {
            setError("scope", { message: error.errors.Scope[0] });
        }
    }

    async function onValid(data: CostReasonFormData) {
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
            title={isEditing ? "Edit Cost Reason" : "Create Cost Reason"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                <AdminFormServerError message={serverError} />

                <Field
                    label="Code"
                    error={errors.code?.message}
                    hint="Numbers only, e.g. 27302."
                    required
                >
                    <Input
                        {...register("code")}
                        maxLength={20}
                        placeholder="e.g. 27302"
                        state={errors.code ? "error" : "default"}
                    />
                </Field>

                <Field label="Reason" error={errors.reason?.message} required>
                    <Input
                        {...register("reason")}
                        maxLength={100}
                        placeholder="e.g. Parking"
                        state={errors.reason ? "error" : "default"}
                    />
                </Field>

                <Field label="Scope" error={errors.scope?.message} required>
                    <Combobox
                        value={scope}
                        label={selectedScopeLabel}
                        options={[...scopeOptions]}
                        searchable={false}
                        placeholder="Select scope"
                        emptyStateText="No scopes available"
                        noMatchesText="No matching scope found"
                        state={errors.scope ? "error" : "default"}
                        onChange={(value) => {
                            if (!value) {
                                return;
                            }

                            setValue(
                                "scope",
                                value as CostReasonFormData["scope"],
                                {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                },
                            );
                        }}
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