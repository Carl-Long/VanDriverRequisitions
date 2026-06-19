import { RequisitionApprovalActions } from "@/features/requisitions-shared/components/requisition-approval-actions";
import type { SaveAction } from "../components/fe-requisition-shell";

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
    return (
        <RequisitionApprovalActions
            activeAction={activeAction}
            onApprove={onApprove}
            onReject={onReject}
        />
    );
}