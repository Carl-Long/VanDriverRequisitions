import { PAGE_SIZE } from "../../constants/fe-requisition-status.constants";
import { FeRequisitionQuery } from "../../types/fe-requisition.types";
import { FeRequisitionFilters } from "../../types/fe-requisiton-filters.types";

export function buildFeRequisitionQuery(
    page: number,
    filters: FeRequisitionFilters,
    currentUserId: string
): FeRequisitionQuery {
    return {
        page,
        pageSize: PAGE_SIZE,

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