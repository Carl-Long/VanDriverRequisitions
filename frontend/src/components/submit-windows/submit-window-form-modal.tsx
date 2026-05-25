"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";

import type { SubmitWindow } from "@/lib/api/submit-windows";
import { DateTimePicker } from "../ui/date/date-time-picker";
import { addDays, setTime } from "@/lib/format/date";
import { Field } from "../ui/field/field";

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

const createSubmitWindowSchema = submitWindowSchema.refine(
    (data) => data.openFrom > new Date(),
    {
        message: "Open from date must be in the future.",
        path: ["openFrom"],
    }
);

type SubmitWindowFormData = z.infer<typeof submitWindowSchema>;

type SubmitWindowFormModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        openFrom: string;
        openTo: string;
    }) => Promise<void>;
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
    const [openFromTouched, setOpenFromTouched] = useState(false);
    const [openToTouched, setOpenToTouched] = useState(false);

    const schema = isEditing
        ? submitWindowSchema
        : createSubmitWindowSchema;

    const {
        control,
        handleSubmit,
        reset,
        setError,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<SubmitWindowFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            openFrom: initial
                ? new Date(initial.openFrom)
                : undefined,
            openTo: initial
                ? new Date(initial.openTo)
                : undefined,
        },
    });

    useEffect(() => {
        if (!open) return;

        reset({
            openFrom: initial
                ? new Date(initial.openFrom)
                : undefined,
            openTo: initial
                ? new Date(initial.openTo)
                : undefined,
        });

        // Only reset auto-behavior flags in CREATE mode
        if (!isEditing) {
            setOpenFromTouched(false);
            setOpenToTouched(false);
        }

        setServerError(null);
    }, [open, initial, reset, isEditing]);

    function handleClose() {
        reset();
        setServerError(null);
        setOpenFromTouched(false);
        setOpenToTouched(false);
        onClose();
    }

    function mapServerErrors(apiErr: {
        detail?: string;
        errors?: Record<string, string[]>;
    }) {
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
            setServerError(
                apiErr.detail ??
                "Something went wrong. Please try again."
            );
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
                }
            );
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={
                isEditing
                    ? "Edit Submit Window"
                    : "Create Submit Window"
            }
        >
            <form onSubmit={handleSubmit(onValid)} className="space-y-5">
                {serverError && (
                    <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                        {serverError}
                    </div>
                )}

                {/* OPEN FROM */}
                <div>
                    <Field
                        label="Open From"
                        error={errors.openFrom?.message}
                        required
                    >
                        <Controller
                            control={control}
                            name="openFrom"
                            render={({ field }) => (
                                <DateTimePicker
                                    value={field.value}
                                    state={
                                        errors.openFrom
                                            ? "error"
                                            : "default"
                                    }
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
                                            const auto = setTime(
                                                addDays(nextDate, 7),
                                                17,
                                                0
                                            );

                                            setValue("openTo", auto);
                                        }
                                    }}
                                />
                            )}
                        />
                    </Field>
                </div>

                {/* OPEN TO */}
                <div>
                    <Field
                        label="Open To"
                        error={errors.openTo?.message}
                        required
                    >
                        <Controller
                            control={control}
                            name="openTo"
                            render={({ field }) => (
                                <DateTimePicker
                                    value={field.value}
                                    state={
                                        errors.openTo
                                            ? "error"
                                            : "default"
                                    }
                                    onChange={(date) => {
                                        setOpenToTouched(true);
                                        field.onChange(date);
                                    }}
                                />
                            )}
                        />
                    </Field>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        tone="primary"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="solid"
                        tone="primary"
                        loading={isSubmitting}
                    >
                        {isEditing ? "Save Changes" : "Create"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}