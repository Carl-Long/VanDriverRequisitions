import { STD_REQUISITION_PAGE_SIZE } from "../../constants/std-requisition-status.constants";
import type { StdRequisitionQuery } from "../../types/std-requisition.types";
import type { StdRequisitionFilters } from "../../types/std-requisition-filters.types";

export function buildStdRequisitionQuery(
    page: number,
    filters: StdRequisitionFilters,
    currentUserId: string,
): StdRequisitionQuery {
    return {
        page,
        pageSize: STD_REQUISITION_PAGE_SIZE,

        ...(filters.requisitionNumber && {
            requisitionNumber: filters.requisitionNumber,
        }),

        ...(filters.status && {
            status: filters.status,
        }),

        ...(filters.shopId && {
            shopId: filters.shopId,
        }),

        createdByUserId:
            filters.createdBy.type === "me"
                ? currentUserId
                : filters.createdBy.type === "user"
                  ? filters.createdBy.userId
                  : undefined,
    };
}