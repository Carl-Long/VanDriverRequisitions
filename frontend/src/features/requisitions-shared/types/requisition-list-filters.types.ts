import type { CreatedByFilter } from "@/features/requisitions-shared/components/filter-fields/created-by-user-filter-field";
import type { RequisitionStatus } from "../constants/requisition-status.constants";

export type RequisitionListFilters = {
    requisitionNumber: string;
    status: RequisitionStatus | "";
    shopId: string | null;
    shopLabel: string | null;
    createdBy: CreatedByFilter;
};