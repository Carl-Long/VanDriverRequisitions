"use client";

import { useState } from "react";
import { z } from "zod";
import { XCircle } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";

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
    const [error, setError] = useState<string | null>(null);

    function handleClose() {
        if (loading) return;

        setRejectionNotes("");
        setError(null);
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

        setError(null);
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

                <div className="space-y-2">
                    <label
                        htmlFor="rejectionNotes"
                        className="text-sm font-medium text-foreground"
                    >
                        Rejection notes
                    </label>

                    <textarea
                        id="rejectionNotes"
                        value={rejectionNotes}
                        rows={5}
                        disabled={loading}
                        onChange={(event) => {
                            setRejectionNotes(event.target.value);
                            setError(null);
                        }}
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Explain why this requisition is being rejected..."
                    />

                    {error && (
                        <p className="text-sm text-danger">
                            {error}
                        </p>
                    )}
                </div>

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
                        <XCircle size={14} />
                        Yes, Reject Requisition
                    </Button>
                </div>
            </div>
        </Modal>
    );
}