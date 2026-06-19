"use client";

import { RequisitionRejectModal } from "@/features/requisitions-shared/components/requisition-reject-modal";

type Props = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: (rejectionNotes: string) => void;
};

export function FeRequisitionRejectModal(props: Readonly<Props>) {
    return <RequisitionRejectModal {...props} />;
}