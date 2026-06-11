import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { SaveAction } from "../components/fe-requisition-shell";

type Props = {
    activeAction: SaveAction;
    onApprove: () => void;
    onReject: () => void;
};

export function FeRequisitionApprovalActions({
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
                <XCircle size={14} />
                Reject
            </Button>

            <Button
                type="button"
                tone="success"
                loading={activeAction === "approve"}
                disabled={isBusy}
                onClick={onApprove}
            >
                <CheckCircle size={14} />
                Approve
            </Button>
        </div>
    );
}
