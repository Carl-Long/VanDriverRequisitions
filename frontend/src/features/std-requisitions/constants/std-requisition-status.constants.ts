import { StdRequisitionFilters } from "../types/std-requisition-filters.types";

export {
    REQUISITION_STATUSES as STD_REQUISITION_STATUSES,
    requisitionStatusConfig as stdRequisitionStatusConfig,
    statusVariants as stdStatusVariants,
} from "@/features/requisitions-shared/constants/requisition-status.constants";

export type { RequisitionStatus as StdRequisitionStatus } from "@/features/requisitions-shared/constants/requisition-status.constants";

export const INITIAL_STD_REQUISITION_FILTERS: StdRequisitionFilters = {
    requisitionNumber: "",
    status: "",
    shopId: null,
    shopLabel: null,
    createdBy: { type: "me" },
};

export const STD_REQUISITION_PAGE_SIZE = 10;

export const STD_REQUISITION_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;