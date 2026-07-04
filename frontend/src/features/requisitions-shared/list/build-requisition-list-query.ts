import { RequisitionListFilters } from "../types/requisition-list-filters.types";
import { createdByUserIdFromFilter } from "./created-by-url-state";

export type RequisitionListQuery = {
    page: number;
    pageSize: number;
    requisitionNumber?: string;
    status?: string;
    shopId?: string;
    createdByUserId?: string;
};

export function buildRequisitionListQuery(
    page: number,
    pageSize: number,
    filters: RequisitionListFilters,
    currentUserId: string,
): RequisitionListQuery {
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

        createdByUserId: createdByUserIdFromFilter(
            filters.createdBy,
            currentUserId,
        ),
    };
}