import type { FeRequisitionQuery } from "../../types/fe-requisition.types";
import type { FeRequisitionFilters } from "../../types/fe-requisiton-filters.types";

export function buildFeRequisitionQuery(
    page: number,
    pageSize: number,
    filters: FeRequisitionFilters,
    currentUserId: string,
): FeRequisitionQuery {
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