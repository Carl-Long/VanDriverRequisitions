import {
    REQUISITION_STATUSES,
    INITIAL_FILTERS,
    RequisitionStatus,
} from "../../constants/fe-requisition-status.constants";
import { FeRequisitionFilters, CreatedByFilter } from "../../types/fe-requisiton-filters.types";

function isValidStatus(value: string | null) {
    return value !== null && REQUISITION_STATUSES.includes(value as any);
}

export function filtersFromSearchParams(searchParams: URLSearchParams): FeRequisitionFilters {
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
        ...INITIAL_FILTERS,

        requisitionNumber: searchParams.get("requisitionNumber") ?? "",

        status: isValidStatus(searchParams.get("status"))
            ? (searchParams.get("status") as RequisitionStatus)
            : "",

        shopId: searchParams.get("shopId"),
        shopLabel: searchParams.get("shopLabel"),
        createdBy: createdByFilter,
    };
}

export function pageFromSearchParams(searchParams: URLSearchParams): number {
    const page = Number(searchParams.get("page"));

    if (Number.isNaN(page) || page < 1) {
        return 1;
    }

    return page;
}

export function buildSearchParams(filters: FeRequisitionFilters, page: number) {
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

    return params;
}
