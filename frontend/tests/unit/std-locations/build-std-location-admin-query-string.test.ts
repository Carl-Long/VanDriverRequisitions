import { describe, expect, it } from "vitest";

import { buildStdLocationAdminQueryString } from "@/features/std-locations/std-locations-api";
import type { StdLocationAdminQuery } from "@/features/std-locations/std-location.types";

function toObject(query: StdLocationAdminQuery) {
    return Object.fromEntries(
        new URLSearchParams(buildStdLocationAdminQueryString(query)).entries(),
    );
}

describe("buildStdLocationAdminQueryString", () => {
    it("uses default pagination and include-inactive values", () => {
        expect(toObject({})).toEqual({
            page: "1",
            pageSize: "20",
            includeInactive: "false",
        });
    });

    it("serialises explicit pagination and include-inactive values", () => {
        expect(
            toObject({
                page: 3,
                pageSize: 50,
                includeInactive: true,
            }),
        ).toEqual({
            page: "3",
            pageSize: "50",
            includeInactive: "true",
        });
    });

    it("trims search before serialising it", () => {
        expect(
            toObject({
                search: "  central warehouse  ",
            }),
        ).toEqual({
            page: "1",
            pageSize: "20",
            includeInactive: "false",
            search: "central warehouse",
        });
    });

    it("omits empty and whitespace-only search values", () => {
        expect(
            toObject({
                search: "   ",
            }),
        ).toEqual({
            page: "1",
            pageSize: "20",
            includeInactive: "false",
        });

        expect(
            toObject({
                search: "",
            }),
        ).toEqual({
            page: "1",
            pageSize: "20",
            includeInactive: "false",
        });

        expect(
            toObject({
                search: null,
            }),
        ).toEqual({
            page: "1",
            pageSize: "20",
            includeInactive: "false",
        });
    });

    it("serialises shop and collection type filters when present", () => {
        expect(
            toObject({
                shopId: "shop-id",
                collectionTypeId: "collection-type-id",
            }),
        ).toEqual({
            page: "1",
            pageSize: "20",
            includeInactive: "false",
            shopId: "shop-id",
            collectionTypeId: "collection-type-id",
        });
    });

    it("omits null shop and collection type filters", () => {
        expect(
            toObject({
                shopId: null,
                collectionTypeId: null,
            }),
        ).toEqual({
            page: "1",
            pageSize: "20",
            includeInactive: "false",
        });
    });

    it("URL-encodes search and filter values", () => {
        const result = buildStdLocationAdminQueryString({
            search: "A&B Depot",
            shopId: "shop id/1",
            collectionTypeId: "type id/2",
        });

        expect(result).toBe(
            "page=1&pageSize=20&includeInactive=false&search=A%26B+Depot&shopId=shop+id%2F1&collectionTypeId=type+id%2F2",
        );
    });
});