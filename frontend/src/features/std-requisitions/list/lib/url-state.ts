import { CreatedByFilter } from "@/features/requisitions-shared/components/filter-fields/created-by-user-filter-field";
import { INITIAL_STD_REQUISITION_FILTERS, STD_REQUISITION_PAGE_SIZE, STD_REQUISITION_PAGE_SIZE_OPTIONS, STD_REQUISITION_STATUSES, type StdRequisitionStatus } from "../../constants/std-requisition-status.constants";

import type { StdRequisitionFilters } from "../../types/std-requisition-filters.types";

function isValidStatus(value: string | null): value is StdRequisitionStatus {
    return (
        value !== null &&
        (STD_REQUISITION_STATUSES as readonly string[]).includes(value)
    );
}

export function filtersFromSearchParams(searchParams: URLSearchParams): StdRequisitionFilters {
    const createdBy = searchParams.get("createdBy");

    let createdByFilter: CreatedByFilter = {
        type: "me",
    };

    if (createdBy === "any") {
        createdByFilter = {
            type: "any",
        };
    }

    if (createdBy === "user") {
        const userId = searchParams.get("createdByUserId");
        const label = searchParams.get("createdByLabel") ?? "";

        if (userId) {
            createdByFilter = { type: "user", userId, label };
        }
    }

    return {
        ...INITIAL_STD_REQUISITION_FILTERS,

        requisitionNumber: searchParams.get("requisitionNumber") ?? "",

        status: isValidStatus(searchParams.get("status"))
            ? (searchParams.get("status") as StdRequisitionStatus)
            : "",

        shopId: searchParams.get("shopId"),
        shopLabel: searchParams.get("shopLabel"),
        createdBy: createdByFilter,
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

    if (!Number.isInteger(pageSize)) {
        return STD_REQUISITION_PAGE_SIZE;
    }

    return (STD_REQUISITION_PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize)
        ? pageSize
        : STD_REQUISITION_PAGE_SIZE;
}

export function buildSearchParams(filters: StdRequisitionFilters, page: number, pageSize = STD_REQUISITION_PAGE_SIZE) {
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

    switch (filters.createdBy.type) {
        case "any":
            params.set("createdBy", "any");
            break;

        case "user":
            params.set("createdBy", "user");
            params.set("createdByUserId", filters.createdBy.userId);
            params.set("createdByLabel", filters.createdBy.label);
            break;

        case "me":
        default:
            break;
    }

    if (page > 1) {
        params.set("page", String(page));
    }

    if (pageSize !== STD_REQUISITION_PAGE_SIZE) {
        params.set("pageSize", String(pageSize));
    }

    return params;
}
