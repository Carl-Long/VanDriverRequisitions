import { appendCreatedBySearchParams, createdByFromSearchParams } from "@/features/requisitions-shared/list/created-by-url-state";
import { INITIAL_STD_REQUISITION_FILTERS, STD_REQUISITION_PAGE_SIZE, STD_REQUISITION_PAGE_SIZE_OPTIONS, STD_REQUISITION_STATUSES, type StdRequisitionStatus } from "../../constants/std-requisition-status.constants";
import type { StdRequisitionFilters } from "../../types/std-requisition-filters.types";

function isValidStatus(value: string | null): value is StdRequisitionStatus {
    return (
        value !== null &&
        (STD_REQUISITION_STATUSES as readonly string[]).includes(value)
    );
}

function isValidPageSize(pageSize: number) {
    return (STD_REQUISITION_PAGE_SIZE_OPTIONS as readonly number[]).includes(
        pageSize,
    );
}

export function filtersFromSearchParams(
    searchParams: URLSearchParams,
): StdRequisitionFilters {
    const status = searchParams.get("status");

    return {
        ...INITIAL_STD_REQUISITION_FILTERS,

        requisitionNumber: searchParams.get("requisitionNumber") ?? "",

        status: isValidStatus(status) ? status : "",

        shopId: searchParams.get("shopId"),
        shopLabel: searchParams.get("shopLabel"),
        createdBy: createdByFromSearchParams(searchParams),
    };
}

export function pageFromSearchParams(searchParams: URLSearchParams): number {
    const page = Number(searchParams.get("page"));

    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
}

export function pageSizeFromSearchParams(searchParams: URLSearchParams): number {
    const pageSize = Number(searchParams.get("pageSize"));

    if (!Number.isInteger(pageSize) || !isValidPageSize(pageSize)) {
        return STD_REQUISITION_PAGE_SIZE;
    }

    return pageSize;
}

export function buildSearchParams(
    filters: StdRequisitionFilters,
    page: number,
    pageSize: number = STD_REQUISITION_PAGE_SIZE,
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

    if (page > 1) {
        params.set("page", String(page));
    }

    if (pageSize !== STD_REQUISITION_PAGE_SIZE) {
        params.set("pageSize", String(pageSize));
    }

    return params;
}