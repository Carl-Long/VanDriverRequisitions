import { describe, expect, it } from "vitest";

import { PAGE_SIZE } from "@/features/fe-requisitions/constants/fe-requisition-status.constants";
import { buildFeRequisitionQuery } from "@/features/fe-requisitions/list/lib/build-fe-requisition-query";
import {
    buildSearchParams,
    filtersFromSearchParams,
    pageFromSearchParams,
} from "@/features/fe-requisitions/list/lib/url-state";
import type { FeRequisitionFilters } from "@/features/fe-requisitions/types/fe-requisiton-filters.types";

function createFilters(
    overrides: Partial<FeRequisitionFilters> = {},
): FeRequisitionFilters {
    return {
        requisitionNumber: "",
        status: "",
        shopId: null,
        shopLabel: null,
        createdBy: { type: "me" },
        ...overrides,
    };
}

function toObject(params: URLSearchParams) {
    return Object.fromEntries(params.entries());
}

describe("FE requisition list URL state", () => {
    it("parses empty search params to the default filter state", () => {
        const result = filtersFromSearchParams(new URLSearchParams());

        expect(result).toEqual({
            requisitionNumber: "",
            status: "",
            shopId: null,
            shopLabel: null,
            createdBy: { type: "me" },
        });
    });

    it("parses all supported filters from search params", () => {
        const params = new URLSearchParams({
            requisitionNumber: "FE-10001",
            status: "Submitted",
            shopId: "shop-id",
            shopLabel: "001 - Test Shop",
            createdBy: "user",
            createdByUserId: "created-by-user-id",
            createdByLabel: "Created By User",
        });

        const result = filtersFromSearchParams(params);

        expect(result).toEqual({
            requisitionNumber: "FE-10001",
            status: "Submitted",
            shopId: "shop-id",
            shopLabel: "001 - Test Shop",
            createdBy: {
                type: "user",
                userId: "created-by-user-id",
                label: "Created By User",
            },
        });
    });

    it("parses created-by any from search params", () => {
        const result = filtersFromSearchParams(
            new URLSearchParams({
                createdBy: "any",
            }),
        );

        expect(result.createdBy).toEqual({ type: "any" });
    });

    it("falls back safely for invalid status and incomplete created-by user params", () => {
        const params = new URLSearchParams({
            status: "Cancelled",
            createdBy: "user",
            createdByLabel: "Missing User Id",
        });

        const result = filtersFromSearchParams(params);

        expect(result.status).toBe("");
        expect(result.createdBy).toEqual({ type: "me" });
    });

    it("parses positive integer pages and defaults unsafe pages to one", () => {
        expect(pageFromSearchParams(new URLSearchParams({ page: "3" }))).toBe(3);

        expect(pageFromSearchParams(new URLSearchParams())).toBe(1);
        expect(pageFromSearchParams(new URLSearchParams({ page: "abc" }))).toBe(1);
        expect(pageFromSearchParams(new URLSearchParams({ page: "0" }))).toBe(1);
        expect(pageFromSearchParams(new URLSearchParams({ page: "-2" }))).toBe(1);
        expect(pageFromSearchParams(new URLSearchParams({ page: "2.5" }))).toBe(1);
    });

    it("serialises only non-default filters and omits page one", () => {
        const params = buildSearchParams(
            createFilters({
                requisitionNumber: "FE-10001",
                status: "Approved",
                shopId: "shop-id",
                shopLabel: "001 - Test Shop",
            }),
            1,
        );

        expect(toObject(params)).toEqual({
            requisitionNumber: "FE-10001",
            status: "Approved",
            shopId: "shop-id",
            shopLabel: "001 - Test Shop",
        });
    });

    it("serialises created-by any", () => {
        const params = buildSearchParams(
            createFilters({
                createdBy: { type: "any" },
            }),
            1,
        );

        expect(toObject(params)).toEqual({
            createdBy: "any",
        });
    });

    it("serialises created-by user and page when page is greater than one", () => {
        const params = buildSearchParams(
            createFilters({
                createdBy: {
                    type: "user",
                    userId: "created-by-user-id",
                    label: "Created By User",
                },
            }),
            4,
        );

        expect(toObject(params)).toEqual({
            createdBy: "user",
            createdByUserId: "created-by-user-id",
            createdByLabel: "Created By User",
            page: "4",
        });
    });
});

describe("buildFeRequisitionQuery", () => {
    it("builds a query using the current user for the default created-by filter", () => {
        const result = buildFeRequisitionQuery(
            2,
            createFilters(),
            "current-user-id",
        );

        expect(result).toEqual({
            page: 2,
            pageSize: PAGE_SIZE,
            createdByUserId: "current-user-id",
        });
    });

    it("builds a query with explicit filters and no created-by user when filtering by anyone", () => {
        const result = buildFeRequisitionQuery(
            3,
            createFilters({
                requisitionNumber: "FE-10001",
                status: "Rejected",
                shopId: "shop-id",
                shopLabel: "001 - Test Shop",
                createdBy: { type: "any" },
            }),
            "current-user-id",
        );

        expect(result).toEqual({
            page: 3,
            pageSize: PAGE_SIZE,
            requisitionNumber: "FE-10001",
            status: "Rejected",
            shopId: "shop-id",
            createdByUserId: undefined,
        });
    });

    it("builds a query using the selected user for a specific created-by filter", () => {
        const result = buildFeRequisitionQuery(
            1,
            createFilters({
                createdBy: {
                    type: "user",
                    userId: "selected-user-id",
                    label: "Selected User",
                },
            }),
            "current-user-id",
        );

        expect(result.createdByUserId).toBe("selected-user-id");
    });
});