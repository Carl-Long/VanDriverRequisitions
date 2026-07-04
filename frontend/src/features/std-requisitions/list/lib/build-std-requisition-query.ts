import type { StdRequisitionQuery } from "../../types/std-requisition.types";
import type { StdRequisitionFilters } from "../../types/std-requisition-filters.types";

export function buildStdRequisitionQuery(
    page: number,
    pageSize: number,
    filters: StdRequisitionFilters,
    currentUserId: string,
): StdRequisitionQuery {
    let createdByUserId: string | undefined;

    if (filters.createdBy.type === "me") {
        createdByUserId = currentUserId;
    }

    if (filters.createdBy.type === "user") {
        createdByUserId = filters.createdBy.userId;
    }

    return {
        page,
        pageSize,

        ...(filters.requisitionNumber && {
            requisitionNumber: filters.requisitionNumber,
        }),

        ...(filters.status && {
            status: filters.status,
        }),

        ...(filters.shopId && {
            shopId: filters.shopId,
        }),

        createdByUserId,
    };
}