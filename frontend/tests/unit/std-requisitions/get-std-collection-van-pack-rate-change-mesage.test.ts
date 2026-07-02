import { describe, expect, it } from "vitest";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { STD_REQUISITION_ROW_CATEGORIES } from "@/features/std-requisitions/constants/std-requisition-row-categories";
import { getStdCollectionVanPackRateChangeMessage } from "@/features/std-requisitions/form/lib/get-std-collection-van-pack-rate-change-message";
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

describe("getStdCollectionVanPackRateChangeMessage", () => {
    it("returns null when there is no van pack rule", () => {
        const result = getStdCollectionVanPackRateChangeMessage([
            createVanPack({
                ratePerVanPack: 6,
            }),
        ]);

        expect(result).toBeNull();
    });

    it("returns null when there are no rows", () => {
        const result = getStdCollectionVanPackRateChangeMessage(
            [],
            createRule({
                maxRate: 7,
            }),
        );

        expect(result).toBeNull();
    });

    it("returns null when all row rates match the current fixed rate", () => {
        const result = getStdCollectionVanPackRateChangeMessage(
            [
                createVanPack({
                    ratePerVanPack: 7,
                }),
                createVanPack({
                    ratePerVanPack: 7.004,
                }),
            ],
            createRule({
                maxRate: 7,
            }),
        );

        expect(result).toBeNull();
    });

    it("returns a message when any row rate differs from the current fixed rate", () => {
        const result = getStdCollectionVanPackRateChangeMessage(
            [
                createVanPack({
                    ratePerVanPack: 7,
                }),
                createVanPack({
                    ratePerVanPack: 6.5,
                }),
            ],
            createRule({
                maxRate: 7.5,
            }),
        );

        expect(result).toBe(
            "The Van Pack fixed price has changed. Saving or submitting this requisition will update Van Pack rows and totals to the current fixed price of £7.50. You can also update each row if you wish.",
        );
    });
});