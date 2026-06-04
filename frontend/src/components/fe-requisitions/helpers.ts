import type { FeRequisitionQuery } from "@/lib/api/fe-requisitions";
import type { FeRequisitionFilters } from "./types";
import { PAGE_SIZE } from "./constants";

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