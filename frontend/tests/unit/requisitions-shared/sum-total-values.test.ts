import { describe, expect, it } from "vitest";

import { sumTotalValues } from "@/features/requisitions-shared/lib/sum-total-values";

describe("sumTotalValues", () => {
    it("returns zero for an empty row collection", () => {
        expect(sumTotalValues([])).toBe(0);
    });

    it("sums total values across rows", () => {
        const result = sumTotalValues([
            { totalValue: 10 },
            { totalValue: 20.5 },
            { totalValue: 3 },
        ]);

        expect(result).toBe(33.5);
    });

    it("treats null, undefined, and missing total values as zero", () => {
        const result = sumTotalValues([
            { totalValue: 10 },
            { totalValue: null },
            { totalValue: undefined },
            {},
        ]);

        expect(result).toBe(10);
    });
});