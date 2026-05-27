import type { REQUISITION_STATUSES } from "./constants";

export type RequisitionStatus =
    (typeof REQUISITION_STATUSES)[number];

export type FeRequisitionFilters = {
    requisitionNumber: string;
    status: RequisitionStatus | "";
    createdByMe: boolean;
};