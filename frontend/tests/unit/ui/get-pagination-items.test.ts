import { getPaginationItems } from "@/components/ui/pagination/get-pagination-items";
import { describe, expect, it } from "vitest";

describe("getPaginationItems", () => {
    it("returns no items when there are no pages", () => {
        expect(getPaginationItems(1, 0)).toEqual([]);
    });

    it("returns all pages when total pages fit without ellipsis", () => {
        expect(getPaginationItems(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("shows the first five pages and last page when current page is near the start", () => {
        expect(getPaginationItems(1, 20)).toEqual([
            1,
            2,
            3,
            4,
            5,
            "ellipsis",
            20,
        ]);

        expect(getPaginationItems(3, 20)).toEqual([
            1,
            2,
            3,
            4,
            5,
            "ellipsis",
            20,
        ]);
    });

    it("shows a centered five-page window when current page is in the middle", () => {
        expect(getPaginationItems(10, 20)).toEqual([
            1,
            "ellipsis",
            8,
            9,
            10,
            11,
            12,
            "ellipsis",
            20,
        ]);
    });

    it("shows the first page and last five pages when current page is near the end", () => {
        expect(getPaginationItems(19, 20)).toEqual([
            1,
            "ellipsis",
            16,
            17,
            18,
            19,
            20,
        ]);

        expect(getPaginationItems(20, 20)).toEqual([
            1,
            "ellipsis",
            16,
            17,
            18,
            19,
            20,
        ]);
    });

    it("clamps pages below the first page", () => {
        expect(getPaginationItems(-5, 20)).toEqual([
            1,
            2,
            3,
            4,
            5,
            "ellipsis",
            20,
        ]);
    });

    it("clamps pages above the last page", () => {
        expect(getPaginationItems(99, 20)).toEqual([
            1,
            "ellipsis",
            16,
            17,
            18,
            19,
            20,
        ]);
    });
});