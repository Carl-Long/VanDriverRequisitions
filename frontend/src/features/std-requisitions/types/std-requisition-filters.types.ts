import { CreatedByFilter } from "@/features/requisitions-shared/components/filter-fields/created-by-user-filter-field";
import type { StdRequisitionStatus } from "../constants/std-requisition-status.constants";

export type StdRequisitionFilters = {
    requisitionNumber: string;
    status: StdRequisitionStatus | "";
    shopId: string | null;
    shopLabel: string | null;
    createdBy: CreatedByFilter;
};
