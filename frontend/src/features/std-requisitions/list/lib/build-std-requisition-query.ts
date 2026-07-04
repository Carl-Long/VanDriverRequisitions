import { createdByUserIdFromFilter } from "@/features/requisitions-shared/list/created-by-url-state";

import { STD_REQUISITION_PAGE_SIZE } from "../../constants/std-requisition-status.constants";
import type { StdRequisitionFilters } from "../../types/std-requisition-filters.types";
import type { StdRequisitionQuery } from "../../types/std-requisition.types";

export function buildStdRequisitionQuery(
    page: number,
    pageSize: number,
    filters: StdRequisitionFilters,
    currentUserId: string,
): StdRequisitionQuery {
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

export function buildDefaultStdRequisitionQuery(
    filters: StdRequisitionFilters,
    currentUserId: string,
): StdRequisitionQuery {
    return buildStdRequisitionQuery(
        1,
        STD_REQUISITION_PAGE_SIZE,
        filters,
        currentUserId,
    );
}