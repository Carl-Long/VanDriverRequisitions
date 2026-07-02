import { describe, expect, it } from "vitest";

import {
    calculateStdCollectionVanPackFormTotal,
    calculateStdCollectionVanPackPercentReturned,
    calculateStdCollectionVanPackUnusedVanPacks,
} from "@/features/std-requisitions/form/lib/calculate-std-collection-van-pack-form";

describe("STD collection van pack calculations", () => {
    it("calculates unused van packs from van packs out minus filled bags", () => {
        const result = calculateStdCollectionVanPackUnusedVanPacks({
            vanPacksOut: 10,
            filledBags: 6,
        });

        expect(result).toBe(4);
    });

    it("does not return negative unused van packs when filled bags exceed van packs out", () => {
        const result = calculateStdCollectionVanPackUnusedVanPacks({
            vanPacksOut: 6,
            filledBags: 10,
        });

        expect(result).toBe(0);
    });

    it("treats null van pack inputs as zero", () => {
        const result = calculateStdCollectionVanPackUnusedVanPacks({
            vanPacksOut: null,
            filledBags: null,
        });

        expect(result).toBe(0);
    });

    it("calculates percent returned from unused van packs", () => {
        const result = calculateStdCollectionVanPackPercentReturned({
            vanPacksOut: 10,
            filledBags: 6,
        });

        expect(result).toBe(40);
    });

    it("returns zero percent returned when no van packs were sent out", () => {
        const result = calculateStdCollectionVanPackPercentReturned({
            vanPacksOut: 0,
            filledBags: 6,
        });

        expect(result).toBe(0);
    });

    it("calculates total value from van packs out and the fixed rate", () => {
        const result = calculateStdCollectionVanPackFormTotal(
            {
                vanPacksOut: 3,
            },
            7.5,
        );

        expect(result).toBe(22.5);
    });

    it("treats null van packs out as zero for total value", () => {
        const result = calculateStdCollectionVanPackFormTotal(
            {
                vanPacksOut: null,
            },
            7.5,
        );

        expect(result).toBe(0);
    });
});