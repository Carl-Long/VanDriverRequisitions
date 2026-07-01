"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/modal";
import { DateTimePicker } from "@/components/ui/date/date-time-picker";
import { Field } from "@/components/ui/field/field";
import { setTime, addDays } from "@/lib/format/date";
import { SubmitWindow } from "../types/submit-window.types";
import { AdminFormServerError } from "@/features/admin-shared/admin-form-server-error";
import { AdminModalFormActions } from "@/features/admin-shared/admin-modal-form-actions";

const submitWindowSchema = z
    .object({
        openFrom: z.date({
            message: "Open from date is required.",
        }),
        openTo: z.date({
            message: "Open to date is required.",
        }),
    })
    .refine((data) => data.openTo > data.openFrom, {
        message: "Open to date must be after the open from date.",
        path: ["openTo"],
    });

const createSubmitWindowSchema = submitWindowSchema.refine((data) => data.openFrom > new Date(), {
    message: "Open from date must be in the future.",
    path: ["openFrom"],
});

type SubmitWindowFormData = z.infer<typeof submitWindowSchema>;

type SubmitWindowFormModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { openFrom: string; openTo: string }) => Promise<void>;
    initial?: SubmitWindow | null;
};

export function SubmitWindowFormModal(props: Readonly<SubmitWindowFormModalProps>) {
    if (!props.open) {
        return null;
    }

    return (
        <SubmitWindowFormModalContent
            key={props.initial?.id ?? "new"}
            {...props}
        />
    );
}

function SubmitWindowFormModalContent({
    open,
    onClose,
    onSubmit,
    initial,
}: Readonly<SubmitWindowFormModalProps>) {
    const isEditing = !!initial;

    const [serverError, setServerError] = useState<string | null>(null);
    const [openFromTouched, setOpenFromTouched] = useState(false);
    const [openToTouched, setOpenToTouched] = useState(false);

    const schema = isEditing ? submitWindowSchema : createSubmitWindowSchema;

    const {
        control,
        handleSubmit,
        setError,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<SubmitWindowFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            openFrom: initial ? new Date(initial.openFrom) : undefined,
            openTo: initial ? new Date(initial.openTo) : undefined,
        },
    });

    function handleClose() {
        onClose();
    }

    function mapServerErrors(apiErr: { detail?: string; errors?: Record<string, string[]> }) {
        if (apiErr.errors) {
            for (const [key, msgs] of Object.entries(apiErr.errors)) {
                const field = key.toLowerCase();

                if (field === "openfrom") {
                    setError("openFrom", {
                        message: msgs[0],
                    });
                }

                if (field === "opento") {
                    setError("openTo", {
                        message: msgs[0],
                    });
                }
            }
        } else {
            setServerError(apiErr.detail ?? "Something went wrong. Please try again.");
        }
    }

    async function onValid(data: SubmitWindowFormData) {
        setServerError(null);

        try {
            await onSubmit({
                openFrom: data.openFrom.toISOString(),
                openTo: data.openTo.toISOString(),
            });

            handleClose();
        } catch (err) {
            mapServerErrors(
                err as {
                    detail?: string;
                    errors?: Record<string, string[]>;
                },
            );
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEditing ? "Edit Submit Window" : "Create Submit Window"}
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                <AdminFormServerError message={serverError} />

                <div>
                    <Field label="Open From" error={errors.openFrom?.message} required>
                        <Controller
                            control={control}
                            name="openFrom"
                            render={({ field }) => (
                                <DateTimePicker
                                    value={field.value}
                                    state={errors.openFrom ? "error" : "default"}
                                    onChange={(date) => {
                                        if (!date) {
                                            field.onChange(date);
                                            return;
                                        }

                                        if (isEditing) {
                                            field.onChange(date);
                                            return;
                                        }

                                        let nextDate = date;

                                        if (!openFromTouched) {
                                            nextDate = setTime(date, 9, 0);
                                            setOpenFromTouched(true);
                                        }

                                        field.onChange(nextDate);

                                        if (!openToTouched) {
                                            const auto = setTime(addDays(nextDate, 7), 17, 0);

                                            setValue("openTo", auto);
                                        }
                                    }}
                                />
                            )}
                        />
                    </Field>
                </div>

                <div>
                    <Field label="Open To" error={errors.openTo?.message} required>
                        <Controller
                            control={control}
                            name="openTo"
                            render={({ field }) => (
                                <DateTimePicker
                                    value={field.value}
                                    state={errors.openTo ? "error" : "default"}
                                    onChange={(date) => {
                                        setOpenToTouched(true);
                                        field.onChange(date);
                                    }}
                                />
                            )}
                        />
                    </Field>
                </div>

                <AdminModalFormActions
                    isEditing={isEditing}
                    isSubmitting={isSubmitting}
                    onCancel={handleClose}
                />
            </form>
        </Modal>
    );
}
