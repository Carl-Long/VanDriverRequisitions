"use client";

import { RequisitionSubmitModal } from "@/features/requisitions-shared/components/requisition-submit-modal";

type Props = {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

export function FeRequisitionSubmitModal(props: Readonly<Props>) {
    return <RequisitionSubmitModal {...props} detailLabel="task details" />;
}