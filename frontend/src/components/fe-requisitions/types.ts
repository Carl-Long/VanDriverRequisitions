import type { RequisitionStatus } from "./constants";

export type FeRequisitionFilters = {
    requisitionNumber: string;
    status: RequisitionStatus | "";
    shopId: string | null;
    shopLabel: string | null;
    createdByUserId: string | null;
    createdByUserLabel: string | null;
    createdByMe: boolean;
};