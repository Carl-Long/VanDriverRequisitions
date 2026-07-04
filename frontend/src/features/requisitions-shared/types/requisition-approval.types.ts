export type ApproveRequisitionRequest = {
    rowVersion: string | null;
};

export type RejectRequisitionRequest = {
    rowVersion: string | null;
    rejectionNotes: string;
};

export type RequisitionApprovalResult = {
    requisitionNumber: string;
};