import { createdByUserIdFromFilter } from "@/features/requisitions-shared/list/created-by-url-state";

import { PAGE_SIZE } from "../../constants/fe-requisition-status.constants";
import type { FeRequisitionQuery } from "../../types/fe-requisition.types";
import type { FeRequisitionFilters } from "../../types/fe-requisiton-filters.types";

export function buildFeRequisitionQuery(
    page: number,
    pageSize: number,
    filters: FeRequisitionFilters,
    currentUserId: string,
): FeRequisitionQuery {
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

export function buildDefaultFeRequisitionQuery(
    filters: FeRequisitionFilters,
    currentUserId: string,
): FeRequisitionQuery {
    return buildFeRequisitionQuery(1, PAGE_SIZE, filters, currentUserId);
}