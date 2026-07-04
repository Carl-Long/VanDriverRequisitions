import { buildSearchParams, filtersFromSearchParams, pageFromSearchParams, pageSizeFromSearchParams } from "@/features/requisitions-shared/list/requisition-list-url-state";
import { describe, expect, it } from "vitest";


describe("requisition-list-url-state", () => {
    describe("filtersFromSearchParams", () => {
        it("returns default filters when no search params are provided", () => {
            const filters = filtersFromSearchParams(new URLSearchParams());

            expect(filters).toEqual({
                requisitionNumber: "",
                status: "",
                shopId: null,
                shopLabel: null,
                createdBy: { type: "me" },
            });
        });

        it("parses all supported filter values", () => {
            const searchParams = new URLSearchParams({
                requisitionNumber: "REQ-123",
                status: "Submitted",
                shopId: "shop-1",
                shopLabel: "001 - Test Shop",
                createdBy: "user",
                createdByUserId: "user-1",
                createdByLabel: "Test User",
            });

            const filters = filtersFromSearchParams(searchParams);

            expect(filters).toEqual({
                requisitionNumber: "REQ-123",
                status: "Submitted",
                shopId: "shop-1",
                shopLabel: "001 - Test Shop",
                createdBy: {
                    type: "user",
                    userId: "user-1",
                    label: "Test User",
                },
            });
        });

        it("defaults invalid statuses to all statuses", () => {
            const searchParams = new URLSearchParams({
                status: "Invalid",
            });

            const filters = filtersFromSearchParams(searchParams);

            expect(filters.status).toBe("");
        });

        it("parses createdBy any", () => {
            const searchParams = new URLSearchParams({
                createdBy: "any",
            });

            const filters = filtersFromSearchParams(searchParams);

            expect(filters.createdBy).toEqual({ type: "any" });
        });

        it("defaults invalid createdBy user filters to me", () => {
            const searchParams = new URLSearchParams({
                createdBy: "user",
            });

            const filters = filtersFromSearchParams(searchParams);

            expect(filters.createdBy).toEqual({ type: "me" });
        });
    });

    describe("pageFromSearchParams", () => {
        it("returns page from valid search params", () => {
            const searchParams = new URLSearchParams({
                page: "3",
            });

            expect(pageFromSearchParams(searchParams)).toBe(3);
        });

        it("defaults invalid page values to 1", () => {
            expect(
                pageFromSearchParams(new URLSearchParams({ page: "0" })),
            ).toBe(1);

            expect(
                pageFromSearchParams(new URLSearchParams({ page: "-1" })),
            ).toBe(1);

            expect(
                pageFromSearchParams(new URLSearchParams({ page: "abc" })),
            ).toBe(1);
        });
    });

    describe("pageSizeFromSearchParams", () => {
        it("returns page size from valid search params", () => {
            const searchParams = new URLSearchParams({
                pageSize: "25",
            });

            expect(pageSizeFromSearchParams(searchParams)).toBe(25);
        });

        it("defaults invalid page size values to 10", () => {
            expect(
                pageSizeFromSearchParams(
                    new URLSearchParams({ pageSize: "0" }),
                ),
            ).toBe(10);

            expect(
                pageSizeFromSearchParams(
                    new URLSearchParams({ pageSize: "999" }),
                ),
            ).toBe(10);

            expect(
                pageSizeFromSearchParams(
                    new URLSearchParams({ pageSize: "abc" }),
                ),
            ).toBe(10);
        });
    });

    describe("buildSearchParams", () => {
        it("omits default filters, page, and page size", () => {
            const params = buildSearchParams(
                {
                    requisitionNumber: "",
                    status: "",
                    shopId: null,
                    shopLabel: null,
                    createdBy: { type: "me" },
                },
                1,
                10,
            );

            expect(params.toString()).toBe("");
        });

        it("serializes non-default filters", () => {
            const params = buildSearchParams(
                {
                    requisitionNumber: "REQ-123",
                    status: "Submitted",
                    shopId: "shop-1",
                    shopLabel: "001 - Test Shop",
                    createdBy: {
                        type: "user",
                        userId: "user-1",
                        label: "Test User",
                    },
                },
                2,
                25,
            );

            expect(params.get("requisitionNumber")).toBe("REQ-123");
            expect(params.get("status")).toBe("Submitted");
            expect(params.get("shopId")).toBe("shop-1");
            expect(params.get("shopLabel")).toBe("001 - Test Shop");
            expect(params.get("createdBy")).toBe("user");
            expect(params.get("createdByUserId")).toBe("user-1");
            expect(params.get("createdByLabel")).toBe("Test User");
            expect(params.get("page")).toBe("2");
            expect(params.get("pageSize")).toBe("25");
        });

        it("serializes createdBy any", () => {
            const params = buildSearchParams(
                {
                    requisitionNumber: "",
                    status: "",
                    shopId: null,
                    shopLabel: null,
                    createdBy: { type: "any" },
                },
                1,
                10,
            );

            expect(params.get("createdBy")).toBe("any");
        });
    });
});