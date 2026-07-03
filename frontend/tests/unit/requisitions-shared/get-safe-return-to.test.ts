import { describe, expect, it } from "vitest";

import {
    getCurrentPathWithSearch,
    getSafeReturnTo,
    withReturnTo,
} from "@/features/requisitions-shared/lib/get-safe-return-to";

describe("getSafeReturnTo", () => {
    const allowedPrefixes = [
        "/fe-requisitions",
        "/std-requisitions",
    ];

    it("returns the fallback when the value is missing", () => {
        const result = getSafeReturnTo(
            null,
            allowedPrefixes,
            "/fallback",
        );

        expect(result).toBe("/fallback");
    });

    it("returns a decoded path when it starts with an allowed prefix", () => {
        const result = getSafeReturnTo(
            encodeURIComponent("/fe-requisitions?page=2&status=Submitted"),
            allowedPrefixes,
            "/fallback",
        );

        expect(result).toBe("/fe-requisitions?page=2&status=Submitted");
    });

    it("returns the fallback when the decoded path does not use an allowed prefix", () => {
        const result = getSafeReturnTo(
            encodeURIComponent("/admin/users"),
            allowedPrefixes,
            "/fallback",
        );

        expect(result).toBe("/fallback");
    });

    it("returns the fallback for protocol-relative paths", () => {
        const result = getSafeReturnTo(
            encodeURIComponent("//example.com/unsafe"),
            allowedPrefixes,
            "/fallback",
        );

        expect(result).toBe("/fallback");
    });

    it("returns the fallback for malformed encoded values", () => {
        const result = getSafeReturnTo(
            "%E0%A4%A",
            allowedPrefixes,
            "/fallback",
        );

        expect(result).toBe("/fallback");
    });
});

describe("getCurrentPathWithSearch", () => {
    it("returns the pathname when there are no search params", () => {
        const result = getCurrentPathWithSearch(
            "/fe-requisitions",
            new URLSearchParams(),
        );

        expect(result).toBe("/fe-requisitions");
    });

    it("returns the pathname with query string when search params exist", () => {
        const result = getCurrentPathWithSearch(
            "/fe-requisitions",
            new URLSearchParams({
                page: "2",
                status: "Submitted",
            }),
        );

        expect(result).toBe("/fe-requisitions?page=2&status=Submitted");
    });
});

describe("withReturnTo", () => {
    it("returns the original href when returnTo is missing", () => {
        expect(withReturnTo("/fe-requisitions/create")).toBe(
            "/fe-requisitions/create",
        );
    });

    it("appends returnTo using question mark when href has no existing query string", () => {
        const result = withReturnTo(
            "/fe-requisitions/create",
            "/fe-requisitions?page=2",
        );

        expect(result).toBe(
            "/fe-requisitions/create?returnTo=%2Ffe-requisitions%3Fpage%3D2",
        );
    });

    it("appends returnTo using ampersand when href already has a query string", () => {
        const result = withReturnTo(
            "/fe-requisitions/create?mode=copy",
            "/fe-requisitions?page=2",
        );

        expect(result).toBe(
            "/fe-requisitions/create?mode=copy&returnTo=%2Ffe-requisitions%3Fpage%3D2",
        );
    });
});