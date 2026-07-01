import { describe, expect, it } from "vitest";

import { updateStdCollectionVanPackDraftFromForm } from "@/features/std-requisitions/form/lib/update-std-collection-van-pack-draft-from-form";
import type { StdCollectionVanPackDraft } from "@/features/std-requisitions/form/types/std-collection-van-pack-draft";
import type { StdCollectionVanPackForm } from "@/features/std-requisitions/form/types/std-collection-van-pack-form";

describe("updateStdCollectionVanPackDraftFromForm", () => {
    it("preserves row identity, normalises postcode, and recalculates totals", () => {
        const existing: StdCollectionVanPackDraft = {
            id: "van-pack-id",
            clientId: "van-pack-client-id",
            deliveryDate: new Date(2026, 5, 13),
            postCodeZone: "OLD",
            vanPacksOut: 1,
            filledBags: 1,
            unusedVanPacks: 0,
            percentReturned: 0,
            ratePerVanPack: 5,
            totalValue: 5,
        };

        const form: StdCollectionVanPackForm = {
            deliveryDate: new Date(2026, 5, 14),
            postCodeZone: " ab1 ",
            vanPacksOut: 10,
            filledBags: 6,
        };

        const result = updateStdCollectionVanPackDraftFromForm(
            existing,
            form,
            7,
        );

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);

        expect(result.deliveryDate).toBe(form.deliveryDate);
        expect(result.postCodeZone).toBe("AB1");

        expect(result.vanPacksOut).toBe(10);
        expect(result.filledBags).toBe(6);

        expect(result.unusedVanPacks).toBe(4);
        expect(result.percentReturned).toBe(40);

        expect(result.ratePerVanPack).toBe(7);
        expect(result.totalValue).toBe(70);
    });

    it("does not allow unused van packs to go below zero", () => {
        const existing: StdCollectionVanPackDraft = {
            id: "van-pack-id",
            clientId: "van-pack-client-id",
            deliveryDate: null,
            postCodeZone: null,
            vanPacksOut: null,
            filledBags: null,
            unusedVanPacks: 0,
            percentReturned: 0,
            ratePerVanPack: 5,
            totalValue: 0,
        };

        const form: StdCollectionVanPackForm = {
            deliveryDate: new Date(2026, 5, 14),
            postCodeZone: "SW1A",
            vanPacksOut: 5,
            filledBags: 8,
        };

        const result = updateStdCollectionVanPackDraftFromForm(
            existing,
            form,
            7,
        );

        expect(result.unusedVanPacks).toBe(0);
        expect(result.percentReturned).toBe(0);
        expect(result.totalValue).toBe(35);
    });

    it("treats missing van packs out as zero for percent returned and total value", () => {
        const existing: StdCollectionVanPackDraft = {
            id: null,
            clientId: "van-pack-client-id",
            deliveryDate: null,
            postCodeZone: null,
            vanPacksOut: null,
            filledBags: null,
            unusedVanPacks: 10,
            percentReturned: 100,
            ratePerVanPack: 5,
            totalValue: 50,
        };

        const form: StdCollectionVanPackForm = {
            deliveryDate: new Date(2026, 5, 14),
            postCodeZone: "m1",
            vanPacksOut: null,
            filledBags: 3,
        };

        const result = updateStdCollectionVanPackDraftFromForm(
            existing,
            form,
            7,
        );

        expect(result.postCodeZone).toBe("M1");
        expect(result.vanPacksOut).toBeNull();
        expect(result.filledBags).toBe(3);
        expect(result.unusedVanPacks).toBe(0);
        expect(result.percentReturned).toBe(0);
        expect(result.totalValue).toBe(0);
    });
});