export const STD_REQUISITION_STATUS = {
    Draft: "Draft",
    Submitted: "Submitted",
    Approved: "Approved",
    Rejected: "Rejected",
} as const;

export type StdRequisitionStatus =
    (typeof STD_REQUISITION_STATUS)[keyof typeof STD_REQUISITION_STATUS];

export const STD_REQUISITION_STATUS_OPTIONS: {
    value: StdRequisitionStatus;
    label: string;
}[] = [
    { value: STD_REQUISITION_STATUS.Draft, label: "Draft" },
    { value: STD_REQUISITION_STATUS.Submitted, label: "Submitted" },
    { value: STD_REQUISITION_STATUS.Approved, label: "Approved" },
    { value: STD_REQUISITION_STATUS.Rejected, label: "Rejected" },
];