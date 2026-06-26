import { CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button/button";
import type { RequisitionSaveAction } from "../types/requisition-save-action";

type Props = {
    activeAction: RequisitionSaveAction;
    onApprove: () => void;
    onReject: () => void;
};

export function RequisitionApprovalActions({
    activeAction,
    onApprove,
    onReject,
}: Readonly<Props>) {
    const isBusy = activeAction !== null;

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button
                type="button"
                tone="danger"
                loading={activeAction === "reject"}
                disabled={isBusy}
                onClick={onReject}
            >
                <XCircle className="size-[1em]" />
                Reject
            </Button>

            <Button
                type="button"
                tone="success"
                loading={activeAction === "approve"}
                disabled={isBusy}
                onClick={onApprove}
            >
                <CheckCircle className="size-[1em]" />
                Approve
            </Button>
        </div>
    );
}