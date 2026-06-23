import { CreatedByFilter } from "@/features/requisitions-shared/components/filter-fields/created-by-user-filter-field";
import { RequisitionStatus } from "../constants/fe-requisition-status.constants";

export type FeRequisitionFilters = {
    requisitionNumber: string;
    status: RequisitionStatus | "";
    shopId: string | null;
    shopLabel: string | null;
    createdBy: CreatedByFilter;
};
