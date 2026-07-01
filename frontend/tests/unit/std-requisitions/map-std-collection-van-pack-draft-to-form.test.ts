import { describe, expect, it } from "vitest";

import { mapStdCollectionVanPackDraftToForm } from "@/features/std-requisitions/form/lib/map-std-collection-van-pack-draft-to-form";
import type { StdCollectionVanPackDraft } from "@/features/std-requisitions/form/types/std-collection-van-pack-draft";

describe("mapStdCollectionVanPackDraftToForm", () => {
    it("maps van pack draft fields to form fields and omits calculated draft fields", () => {
        const row: StdCollectionVanPackDraft = {
            id: "van-pack-id",
            clientId: "van-pack-client-id",
            deliveryDate: new Date(2026, 5, 14),

            postCodeZone: "AB1",

            vanPacksOut: 10,
            filledBags: 6,

            unusedVanPacks: 4,
            percentReturned: 40,

            ratePerVanPack: 7,
            totalValue: 70,
        };

        const result = mapStdCollectionVanPackDraftToForm(row);

        expect(result).toEqual({
            deliveryDate: row.deliveryDate,
            postCodeZone: "AB1",
            vanPacksOut: 10,
            filledBags: 6,
        });
    });

    it("maps a null postcode zone to an empty string for the form", () => {
        const row: StdCollectionVanPackDraft = {
            id: "van-pack-id",
            clientId: "van-pack-client-id",
            deliveryDate: null,

            postCodeZone: null,

            vanPacksOut: null,
            filledBags: null,

            unusedVanPacks: 0,
            percentReturned: 0,

            ratePerVanPack: 7,
            totalValue: 0,
        };

        const result = mapStdCollectionVanPackDraftToForm(row);

        expect(result).toEqual({
            deliveryDate: null,
            postCodeZone: "",
            vanPacksOut: null,
            filledBags: null,
        });
    });
});