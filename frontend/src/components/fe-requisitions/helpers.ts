import type { FeRequisitionQuery } from "@/lib/api/fe-requisitions";

import { PAGE_SIZE } from "./constants";

import type { FeRequisitionFilters } from "./types";

export function buildFeRequisitionQuery(
    page: number,
    filters: FeRequisitionFilters,
): FeRequisitionQuery {
    return {
        page,
        pageSize: PAGE_SIZE,
        createdByMe: filters.createdByMe,

        ...(filters.requisitionNumber && {
            requisitionNumber:
                filters.requisitionNumber,
        }),

        ...(filters.status && {
            status: filters.status,
        }),
    };
}