import { RequisitionListFilters } from "../types/requisition-list-filters.types";

export const INITIAL_REQUISITION_LIST_FILTERS: RequisitionListFilters = {
    requisitionNumber: "",
    status: "",
    shopId: null,
    shopLabel: null,
    createdBy: { type: "me" },
};

export const REQUISITION_LIST_PAGE_SIZE = 10;

export const REQUISITION_LIST_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;