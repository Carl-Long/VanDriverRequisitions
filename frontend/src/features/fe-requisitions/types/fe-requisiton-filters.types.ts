import { RequisitionStatus } from "../constants/fe-requisition-status.constants";

export type CreatedByFilter =
    | { type: "any" }
    | { type: "me" }
    | { type: "user"; userId: string; label: string };

export type FeRequisitionFilters = {
    requisitionNumber: string;
    status: RequisitionStatus | "";
    shopId: string | null;
    shopLabel: string | null;
    createdBy: CreatedByFilter;
};
