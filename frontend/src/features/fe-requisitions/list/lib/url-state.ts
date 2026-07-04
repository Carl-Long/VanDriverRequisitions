import {
    appendCreatedBySearchParams,
    createdByFromSearchParams,
} from "@/features/requisitions-shared/list/created-by-url-state";
import {
    appendPageSearchParam,
    appendPageSizeSearchParam,
    pageFromSearchParams as sharedPageFromSearchParams,
    pageSizeFromSearchParams as sharedPageSizeFromSearchParams,
} from "@/features/requisitions-shared/list/page-url-state";

import {
    INITIAL_FILTERS,
    PAGE_SIZE,
    PAGE_SIZE_OPTIONS,
    REQUISITION_STATUSES,
    type RequisitionStatus,
} from "../../constants/fe-requisition-status.constants";
import type { FeRequisitionFilters } from "../../types/fe-requisiton-filters.types";

function isValidStatus(value: string | null): value is RequisitionStatus {
    return (
        value !== null &&
        (REQUISITION_STATUSES as readonly string[]).includes(value)
    );
}

export function filtersFromSearchParams(
    searchParams: URLSearchParams,
): FeRequisitionFilters {
    const status = searchParams.get("status");

    return {
        ...INITIAL_FILTERS,

        requisitionNumber: searchParams.get("requisitionNumber") ?? "",

        status: isValidStatus(status) ? status : "",

        shopId: searchParams.get("shopId"),
        shopLabel: searchParams.get("shopLabel"),
        createdBy: createdByFromSearchParams(searchParams),
    };
}

export function pageFromSearchParams(searchParams: URLSearchParams): number {
    return sharedPageFromSearchParams(searchParams);
}

export function pageSizeFromSearchParams(searchParams: URLSearchParams): number {
    return sharedPageSizeFromSearchParams(
        searchParams,
        PAGE_SIZE,
        PAGE_SIZE_OPTIONS,
    );
}

export function buildSearchParams(
    filters: FeRequisitionFilters,
    page: number,
    pageSize: number = PAGE_SIZE,
) {
    const params = new URLSearchParams();

    if (filters.requisitionNumber) {
        params.set("requisitionNumber", filters.requisitionNumber);
    }

    if (filters.status) {
        params.set("status", filters.status);
    }

    if (filters.shopId) {
        params.set("shopId", filters.shopId);
    }

    if (filters.shopLabel) {
        params.set("shopLabel", filters.shopLabel);
    }

    appendCreatedBySearchParams(params, filters.createdBy);
    appendPageSearchParam(params, page);
    appendPageSizeSearchParam(params, pageSize, PAGE_SIZE);

    return params;
}