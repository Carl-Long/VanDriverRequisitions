import { FeRequisitionFilters } from "../types/fe-requisiton-filters.types";

export {
    REQUISITION_STATUSES,
    requisitionStatusConfig,
    statusVariants,
} from "@/features/requisitions-shared/constants/requisition-status.constants";

export type { RequisitionStatus } from "@/features/requisitions-shared/constants/requisition-status.constants";

export const INITIAL_FILTERS: FeRequisitionFilters = {
    requisitionNumber: "",
    status: "",
    shopId: null,
    shopLabel: null,
    createdBy: { type: "me" },
};

export const PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;