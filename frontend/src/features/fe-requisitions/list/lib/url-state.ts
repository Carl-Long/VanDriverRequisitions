import { appendCreatedBySearchParams, createdByFromSearchParams } from "@/features/requisitions-shared/list/created-by-url-state";
import { INITIAL_FILTERS, PAGE_SIZE, PAGE_SIZE_OPTIONS, REQUISITION_STATUSES, type RequisitionStatus } from "../../constants/fe-requisition-status.constants";
import type { FeRequisitionFilters } from "../../types/fe-requisiton-filters.types";

function isValidStatus(value: string | null): value is RequisitionStatus {
    return (
        value !== null &&
        (REQUISITION_STATUSES as readonly string[]).includes(value)
    );
}

function isValidPageSize(pageSize: number) {
    return (PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize);
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
    const page = Number(searchParams.get("page"));

    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
}

export function pageSizeFromSearchParams(searchParams: URLSearchParams): number {
    const pageSize = Number(searchParams.get("pageSize"));

    if (!Number.isInteger(pageSize) || !isValidPageSize(pageSize)) {
        return PAGE_SIZE;
    }

    return pageSize;
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

    if (page > 1) {
        params.set("page", String(page));
    }

    if (pageSize !== PAGE_SIZE) {
        params.set("pageSize", String(pageSize));
    }

    return params;
}