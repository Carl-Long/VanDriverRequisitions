"use client";

import { useState } from "react";
import { z } from "zod";
import { XCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { Field } from "@/components/ui/field/field";
import { Textarea } from "@/components/ui/field/textarea";

const rejectSchema = z.object({
    rejectionNotes: z
        .string()
        .trim()
        .min(1, "Rejection notes are required.")
        .max(1000, "Rejection notes cannot exceed 1000 characters."),
});

type Props = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: (rejectionNotes: string) => void;
};

export function FeRequisitionRejectModal({
    open,
    loading,
    onClose,
    onConfirm,
}: Readonly<Props>) {
    const [rejectionNotes, setRejectionNotes] = useState("");
    const [error, setError] = useState<string | undefined>();

    function handleClose() {
        if (loading) {
            return;
        }

        setRejectionNotes("");
        setError(undefined);
        onClose();
    }

    function handleConfirm() {
        const result = rejectSchema.safeParse({
            rejectionNotes,
        });

        if (!result.success) {
            setError(
                result.error.issues[0]?.message ??
                "Rejection notes are invalid.",
            );

            return;
        }

        setError(undefined);
        onConfirm(result.data.rejectionNotes);
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Confirm Rejection"
            titleClassName="text-danger"
        >
            <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-lg border border-danger-border bg-danger-surface p-4">
                    <XCircle
                        size={18}
                        className="mt-0.5 shrink-0 text-danger"
                    />

                    <div>
                        <p className="font-medium text-danger">
                            This requisition will be rejected.
                        </p>

                        <p className="mt-1 text-sm text-foreground">
                            The requester will need to review the rejection
                            notes, make changes, and resubmit.
                        </p>
                    </div>
                </div>

                <Field
                    label="Rejection notes"
                    required
                    error={error}
                    hint="Explain what needs to be corrected before this can be resubmitted."
                >
                    <Textarea
                        value={rejectionNotes}
                        rows={5}
                        disabled={loading}
                        state={error ? "error" : "default"}
                        onChange={(event) => {
                            setRejectionNotes(event.target.value);
                            setError(undefined);
                        }}
                        placeholder="Explain why this requisition is being rejected..."
                    />
                </Field>

                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        No, Go Back
                    </Button>

                    <Button
                        type="button"
                        tone="danger"
                        loading={loading}
                        onClick={handleConfirm}
                    >
                        Reject Requisition
                    </Button>
                </div>
            </div>
        </Modal>
    );
}