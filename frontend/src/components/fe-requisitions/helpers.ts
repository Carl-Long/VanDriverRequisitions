import type { FeRequisitionQuery } from "@/lib/api/fe-requisitions";

import type { FeRequisitionFilters } from "./types";

import { PAGE_SIZE } from "./constants";

export function buildFeRequisitionQuery(
    page: number,
    filters: FeRequisitionFilters,
): FeRequisitionQuery {
    return {
        page,
        pageSize: PAGE_SIZE,

        ...(filters.requisitionNumber && {
            requisitionNumber:
                filters.requisitionNumber,
        }),

        ...(filters.status && {
            status: filters.status,
        }),

        ...(filters.shopId && {
            shopId: filters.shopId,
        }),

        ...(filters.createdBy.type === "me" && {
            createdByMe: true,
        }),

        ...(filters.createdBy.type === "user" && {
            createdByUserId:
                filters.createdBy.userId,
        }),

    };
}