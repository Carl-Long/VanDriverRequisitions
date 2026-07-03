import { describe, expect, it } from "vitest";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { STD_REQUISITION_ROW_CATEGORIES } from "@/features/std-requisitions/constants/std-requisition-row-categories";
import { getStdCollectionVanPackLimitStatus } from "@/features/std-requisitions/form/lib/get-std-collection-van-pack-limit-status";
import type { StdCollectionVanPackDraft } from "@/features/std-requisitions/form/types/std-collection-van-pack-draft";
import { FASCIAS } from "@/lib/constants/fascias";

function createVanPack(
    overrides: Partial<StdCollectionVanPackDraft> = {},
): StdCollectionVanPackDraft {
    return {
        clientId: "van-pack-client-id",
        id: null,
        deliveryDate: new Date(2026, 5, 14),
        postCodeZone: "AB",
        vanPacksOut: 0,
        filledBags: 0,
        unusedVanPacks: 0,
        percentReturned: 0,
        ratePerVanPack: 7,
        totalValue: 0,
        ...overrides,
    };
}

function createRule(
    overrides: Partial<RequisitionLimitRuleSummary> = {},
): RequisitionLimitRuleSummary {
    return {
        id: "std-van-pack-limit-rule-id",
        category: STD_REQUISITION_ROW_CATEGORIES.VAN_PACK,
        categoryName: "Van Pack",
        feTaskTypeId: null,
        feTaskTypeName: null,
        isFeTaskTypeActive: null,
        fascia: FASCIAS.STD,
        fasciaName: "STD",
        maxQuantity: 10,
        maxRate: 7,
        createdAtUtc: "2026-01-01T00:00:00Z",
        createdByNameSnapshot: "Created By",
        updatedAtUtc: null,
        updatedByNameSnapshot: null,
        ...overrides,
    };
}

describe("getStdCollectionVanPackLimitStatus", () => {
    it("returns missing-limit when no van pack pricing rule is configured", () => {
        const result = getStdCollectionVanPackLimitStatus(createVanPack());

        expect(result).toEqual({
            state: "missing-limit",
            messages: ["No STD van pack pricing rule is configured."],
        });
    });

    it("returns ok when van packs out is exactly on the configured maximum", () => {
        const result = getStdCollectionVanPackLimitStatus(
            createVanPack({
                vanPacksOut: 10,
            }),
            createRule({
                maxQuantity: 10,
            }),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("treats null van packs out as a clean value", () => {
        const result = getStdCollectionVanPackLimitStatus(
            createVanPack({
                vanPacksOut: null,
            }),
            createRule(),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("returns an over-limit message when van packs out exceeds the configured maximum", () => {
        const result = getStdCollectionVanPackLimitStatus(
            createVanPack({
                vanPacksOut: 11,
            }),
            createRule({
                maxQuantity: 10,
            }),
        );

        expect(result).toEqual({
            state: "exceeds-limit",
            messages: ["Van packs out exceed maximum of 10."],
        });
    });
});