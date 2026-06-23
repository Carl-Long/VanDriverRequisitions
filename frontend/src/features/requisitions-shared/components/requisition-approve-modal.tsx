"use client";

import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button/button";
import { Modal } from "@/components/ui/modal";

type Props = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function RequisitionApproveModal({ open, loading, onClose, onConfirm }: Readonly<Props>) {
    return (
        <Modal open={open} onClose={onClose} title="Confirm Approval" titleClassName="text-success">
            <div className="space-y-5">
                <div className="flex items-start gap-3 rounded-lg border border-success-border bg-success-surface p-4">
                    <CheckCircle size={18} className="mt-0.5 shrink-0 text-success" />

                    <div>
                        <p className="font-medium text-success">
                            This requisition will be approved.
                        </p>

                        <p className="mt-1 text-sm text-foreground">
                            A PO number will be generated and the requisition will no longer be
                            editable.
                        </p>
                    </div>
                </div>

                <p className="text-sm text-foreground">
                    Please confirm that the submitted requisition has been reviewed and is ready for
                    approval.
                </p>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        No, Go Back
                    </Button>

                    <Button type="button" tone="success" loading={loading} onClick={onConfirm}>
                        Approve Requisition
                    </Button>
                </div>
            </div>
        </Modal>
    );
}