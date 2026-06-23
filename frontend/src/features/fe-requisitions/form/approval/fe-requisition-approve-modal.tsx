"use client";

import { RequisitionApproveModal } from "@/features/requisitions-shared/components/requisition-approve-modal";

type Props = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function FeRequisitionApproveModal(props: Readonly<Props>) {
    return <RequisitionApproveModal {...props} />;
}