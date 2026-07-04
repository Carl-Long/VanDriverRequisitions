import { CreatedByFilter } from "@/features/requisitions-shared/components/filter-fields/created-by-user-filter-field";
import { INITIAL_FILTERS, PAGE_SIZE, PAGE_SIZE_OPTIONS, REQUISITION_STATUSES, type RequisitionStatus } from "../../constants/fe-requisition-status.constants";
import { FeRequisitionFilters } from "../../types/fe-requisiton-filters.types";

function isValidStatus(value: string | null): value is RequisitionStatus {
    return (
        value !== null &&
        (REQUISITION_STATUSES as readonly string[]).includes(value)
    );
}

export function filtersFromSearchParams(searchParams: URLSearchParams): FeRequisitionFilters {
    const createdBy = searchParams.get("createdBy");
    const status = searchParams.get("status");

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
        ...INITIAL_FILTERS,

        requisitionNumber: searchParams.get("requisitionNumber") ?? "",

        status: isValidStatus(status) ? status : "",

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
        return PAGE_SIZE;
    }

    return (PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize)
        ? pageSize
        : PAGE_SIZE;
}

export function buildSearchParams(filters: FeRequisitionFilters, page: number, pageSize = PAGE_SIZE) {
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

    if (pageSize !== PAGE_SIZE) {
        params.set("pageSize", String(pageSize));
    }

    return params;
}