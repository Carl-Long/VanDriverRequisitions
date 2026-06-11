"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button/button";
import { Send } from "lucide-react";

type Props = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function FeRequisitionSubmitModal({ open, loading, onClose, onConfirm }: Readonly<Props>) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Confirm Submission"
            titleClassName="text-danger"
        >
            <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-lg border border-danger-border bg-danger-surface p-4">
                    <Send size={18} className="mt-0.5 shrink-0 text-danger" />

                    <div>
                        <p className="font-medium text-danger">This action cannot be undone.</p>

                        <p className="mt-1 text-sm text-foreground">
                            Once this requisition has been submitted, it can no longer be edited or
                            changed.
                        </p>
                    </div>
                </div>

                <p className="text-sm text-foreground">
                    Please confirm that all information, quantities, rates and task details have
                    been reviewed and are ready for submission.
                </p>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        No, Go Back
                    </Button>

                    <Button type="button" tone="danger" loading={loading} onClick={onConfirm}>
                        <Send size={14} />
                        Yes, Submit Requisition
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
