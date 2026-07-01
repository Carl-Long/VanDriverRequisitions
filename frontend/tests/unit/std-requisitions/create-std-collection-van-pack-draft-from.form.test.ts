import { afterEach, describe, expect, it, vi } from "vitest";

import { createStdCollectionVanPackDraftFromForm } from "@/features/std-requisitions/form/lib/create-std-collection-van-pack-draft-from-form";
import type { StdCollectionVanPackForm } from "@/features/std-requisitions/form/types/std-collection-van-pack-form";

describe("createStdCollectionVanPackDraftFromForm", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates a new van pack draft row with normalised postcode and calculated totals", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000007",
        );

        const form: StdCollectionVanPackForm = {
            deliveryDate: new Date(2026, 5, 14),
            postCodeZone: " ab1 ",
            vanPacksOut: 10,
            filledBags: 6,
        };

        const result = createStdCollectionVanPackDraftFromForm({
            form,
            ratePerVanPack: 7,
        });

        expect(result).toEqual({
            clientId: "00000000-0000-4000-8000-000000000007",
            id: null,

            deliveryDate: form.deliveryDate,

            postCodeZone: "AB1",

            vanPacksOut: 10,
            filledBags: 6,

            unusedVanPacks: 4,
            percentReturned: 40,

            ratePerVanPack: 7,
            totalValue: 70,
        });
    });

    it("does not allow unused van packs to go below zero", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000008",
        );

        const form: StdCollectionVanPackForm = {
            deliveryDate: new Date(2026, 5, 14),
            postCodeZone: "sw1a",
            vanPacksOut: 5,
            filledBags: 8,
        };

        const result = createStdCollectionVanPackDraftFromForm({
            form,
            ratePerVanPack: 7,
        });

        expect(result.unusedVanPacks).toBe(0);
        expect(result.percentReturned).toBe(0);
        expect(result.totalValue).toBe(35);
    });

    it("treats missing van packs out as zero for percent returned and total value", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000009",
        );

        const form: StdCollectionVanPackForm = {
            deliveryDate: new Date(2026, 5, 14),
            postCodeZone: "m1",
            vanPacksOut: null,
            filledBags: 3,
        };

        const result = createStdCollectionVanPackDraftFromForm({
            form,
            ratePerVanPack: 7,
        });

        expect(result.postCodeZone).toBe("M1");
        expect(result.vanPacksOut).toBeNull();
        expect(result.filledBags).toBe(3);
        expect(result.unusedVanPacks).toBe(0);
        expect(result.percentReturned).toBe(0);
        expect(result.totalValue).toBe(0);
    });
});