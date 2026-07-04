import {
    appendCreatedBySearchParams,
    createdByFromSearchParams,
} from "./created-by-url-state";
import {
    appendPageSearchParam,
    appendPageSizeSearchParam,
    pageFromSearchParams as sharedPageFromSearchParams,
    pageSizeFromSearchParams as sharedPageSizeFromSearchParams,
} from "./page-url-state";

import {
    INITIAL_REQUISITION_LIST_FILTERS,
    REQUISITION_LIST_PAGE_SIZE,
    REQUISITION_LIST_PAGE_SIZE_OPTIONS,
} from "../constants/requisition-list.constants";
import {
    REQUISITION_STATUSES,
    type RequisitionStatus,
} from "../constants/requisition-status.constants";
import { RequisitionListFilters } from "../types/requisition-list-filters.types";

function isValidStatus(value: string | null): value is RequisitionStatus {
    return (
        value !== null &&
        (REQUISITION_STATUSES as readonly string[]).includes(value)
    );
}

export function filtersFromSearchParams(
    searchParams: URLSearchParams,
): RequisitionListFilters {
    const status = searchParams.get("status");

    return {
        ...INITIAL_REQUISITION_LIST_FILTERS,

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
        REQUISITION_LIST_PAGE_SIZE,
        REQUISITION_LIST_PAGE_SIZE_OPTIONS,
    );
}

export function buildSearchParams(
    filters: RequisitionListFilters,
    page: number,
    pageSize: number = REQUISITION_LIST_PAGE_SIZE,
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
    appendPageSizeSearchParam(
        params,
        pageSize,
        REQUISITION_LIST_PAGE_SIZE,
    );

    return params;
}