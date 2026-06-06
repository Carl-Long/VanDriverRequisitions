import { CheckCircle, XCircle, } from "lucide-react";

import { Button } from "@/components/ui/button/button";

type Props = {
    loading: boolean;
    onApprove: () => void;
    onReject: () => void;
};

export function FeRequisitionApprovalActions({
    loading,
    onApprove,
    onReject,
}: Readonly<Props>) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button
                type="button"
                tone="secondary"
                disabled={loading}
                onClick={onReject}
            >
                <XCircle size={16} />
                <span>Reject</span>
            </Button>

            <Button
                type="button"
                tone="success"
                disabled={loading}
                onClick={onApprove}
            >
                <CheckCircle size={16} />
                <span>Approve</span>
            </Button>
        </div>
    );
}