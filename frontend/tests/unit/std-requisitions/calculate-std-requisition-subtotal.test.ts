import { describe, expect, it } from "vitest";

import { STD_CHARGE_TYPE } from "@/features/std-requisitions/constants/std-charge-type.constants";
import { calculateStdRequisitionSubtotal } from "@/features/std-requisitions/form/lib/calculate-std-requisition-subtotal";
import type { StdAdditionalCostDraft } from "@/features/std-requisitions/form/types/std-additional-cost-draft";
import type { StdCollectionChargeBanksAndBinsDraft } from "@/features/std-requisitions/form/types/std-collection-charge-banks-and-bins-draft";
import type { StdCollectionVanPackDraft } from "@/features/std-requisitions/form/types/std-collection-van-pack-draft";
import type { StdPickupDraft } from "@/features/std-requisitions/form/types/std-pickup-draft";
import type { StdRequisitionDraft } from "@/features/std-requisitions/form/types/std-requisition-draft";
import type { StdTransferDraft } from "@/features/std-requisitions/form/types/std-transfer-draft";

function createPickup(
    overrides: Partial<StdPickupDraft> = {},
): StdPickupDraft {
    return {
        clientId: "pickup-client-id",
        id: null,
        date: new Date(2026, 5, 14),
        numberOfBags: 1,
        numberOfHouseholds: 1,
        chargeType: STD_CHARGE_TYPE.Mileage,
        miles: 0,
        ratePerMile: 0.45,
        flatCharge: null,
        totalValue: 0,
        ...overrides,
    };
}

function createTransfer(
    overrides: Partial<StdTransferDraft> = {},
): StdTransferDraft {
    return {
        clientId: "transfer-client-id",
        id: null,
        date: new Date(2026, 5, 14),

        shopIdFrom: "from-shop-id",
        shopLabelFrom: "001 - From Shop",
        shopCodeFrom: "001",
        shopNameFrom: "From Shop",
        isShopFromActive: true,

        shopIdTo: "to-shop-id",
        shopLabelTo: "002 - To Shop",
        shopCodeTo: "002",
        shopNameTo: "To Shop",
        isShopToActive: true,

        numberOfBags: 1,
        numberOfBoxes: 1,

        chargeType: STD_CHARGE_TYPE.Mileage,
        miles: 0,
        ratePerMile: 0.45,
        flatCharge: null,

        totalValue: 0,
        ...overrides,
    };
}

function createBanksAndBins(
    overrides: Partial<StdCollectionChargeBanksAndBinsDraft> = {},
): StdCollectionChargeBanksAndBinsDraft {
    return {
        clientId: "banks-and-bins-client-id",
        id: null,

        date: new Date(2026, 5, 14),

        collectionTypeId: "collection-type-id",
        collectionTypeLabel: "Banks",
        collectionTypeCode: "BANKS",
        isCollectionTypeActive: true,

        locationId: "location-id",
        locationLabel: "Location",
        locationPostCode: "AB1 2CD",
        isLocationActive: true,

        numberOfBags: 1,

        chargeType: STD_CHARGE_TYPE.Mileage,
        miles: 0,
        ratePerMile: 0.45,
        flatCharge: null,

        totalValue: 0,
        ...overrides,
    };
}

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

function createAdditionalCost(
    overrides: Partial<StdAdditionalCostDraft> = {},
): StdAdditionalCostDraft {
    return {
        clientId: "additional-cost-client-id",
        id: null,

        date: new Date(2026, 5, 14),

        reasonId: "reason-id",
        reasonCode: "27302",
        reasonText: "Additional cost",
        isReasonActive: true,

        numberOfBags: 1,

        chargeType: STD_CHARGE_TYPE.Mileage,
        miles: 0,
        ratePerMile: 0.45,
        flatCharge: null,

        totalValue: 0,
        ...overrides,
    };
}

function createDraft(
    overrides: Partial<StdRequisitionDraft> = {},
): StdRequisitionDraft {
    return {
        requisitionId: null,
        rowVersion: null,
        requisitionNumber: null,
        status: null,
        requisitionDate: null,

        vanDriverId: null,
        vanDriverLabel: null,
        vanDriverSummary: null,
        vanDriverName: null,

        shopId: null,
        shopLabel: null,
        isShopActive: true,

        submittedByNameSnapshot: null,
        submittedAtUtc: null,

        poNumber: null,
        approvedByNameSnapshot: null,
        approvedAtUtc: null,

        rejectionNotes: null,
        rejectedByNameSnapshot: null,
        rejectedAtUtc: null,

        collectionChargesBanksAndBins: [],
        collectionVanPacks: [],
        pickups: [],
        transfers: [],
        additionalCosts: [],

        submissionHistory: [],

        ...overrides,
    };
}

describe("calculateStdRequisitionSubtotal", () => {
    it("returns zero when the draft has no child rows", () => {
        const result = calculateStdRequisitionSubtotal(createDraft());

        expect(result).toBe(0);
    });

    it("includes pickups, transfers, banks and bins, van packs, and additional costs", () => {
        const result = calculateStdRequisitionSubtotal(
            createDraft({
                pickups: [
                    createPickup({ totalValue: 10 }),
                ],
                transfers: [
                    createTransfer({ totalValue: 2.5 }),
                ],
                collectionChargesBanksAndBins: [
                    createBanksAndBins({ totalValue: 3 }),
                ],
                collectionVanPacks: [
                    createVanPack({ totalValue: 4 }),
                ],
                additionalCosts: [
                    createAdditionalCost({ totalValue: 5 }),
                ],
            }),
        );

        expect(result).toBe(24.5);
    });

    it("treats null banks-and-bins row totals as zero", () => {
        const result = calculateStdRequisitionSubtotal(
            createDraft({
                collectionChargesBanksAndBins: [
                    createBanksAndBins({ totalValue: null }),
                ],
                pickups: [
                    createPickup({ totalValue: 10 }),
                ],
            }),
        );

        expect(result).toBe(10);
    });
});