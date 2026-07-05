import { describe, expect, it } from "vitest";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { REQUISITION_TAB_ISSUE_SEVERITY } from "@/features/requisitions-shared/types/requisition-tab-issue-severity";
import { STD_CHARGE_TYPE } from "@/features/std-requisitions/constants/std-charge-type.constants";
import { STD_REQUISITION_ROW_CATEGORIES } from "@/features/std-requisitions/constants/std-requisition-row-categories";
import { getStdRequisitionTabIssues } from "@/features/std-requisitions/form/lib/get-std-requisition-tab-issues";
import type { StdAdditionalCostDraft } from "@/features/std-requisitions/form/types/std-additional-cost-draft";
import type { StdCollectionChargeBanksAndBinsDraft } from "@/features/std-requisitions/form/types/std-collection-charge-banks-and-bins-draft";
import type { StdCollectionVanPackDraft } from "@/features/std-requisitions/form/types/std-collection-van-pack-draft";
import type { StdPickupDraft } from "@/features/std-requisitions/form/types/std-pickup-draft";
import type { StdRequisitionDraft } from "@/features/std-requisitions/form/types/std-requisition-draft";
import type { StdTransferDraft } from "@/features/std-requisitions/form/types/std-transfer-draft";
import { FASCIAS } from "@/lib/constants/fascias";

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

function createRule(
    overrides: Partial<RequisitionLimitRuleSummary> = {},
): RequisitionLimitRuleSummary {
    return {
        id: "std-limit-rule-id",
        category: STD_REQUISITION_ROW_CATEGORIES.MILEAGE,
        categoryName: "Mileage",
        feTaskTypeId: null,
        feTaskTypeName: null,
        isFeTaskTypeActive: null,
        fascia: FASCIAS.STD,
        fasciaName: "STD",
        maxQuantity: 20,
        maxRate: 0.45,
        createdAtUtc: "2026-01-01T00:00:00Z",
        createdByNameSnapshot: "Created By",
        updatedAtUtc: null,
        updatedByNameSnapshot: null,
        ...overrides,
    };
}

const mileageRule = createRule();

const flatChargeRule = createRule({
    id: "std-flat-charge-limit-rule-id",
    category: STD_REQUISITION_ROW_CATEGORIES.FLAT_CHARGE,
    categoryName: "Flat Charge",
    maxQuantity: 1,
    maxRate: 10,
});

const vanPackRule = createRule({
    id: "std-van-pack-limit-rule-id",
    category: STD_REQUISITION_ROW_CATEGORIES.VAN_PACK,
    categoryName: "Van Pack",
    maxQuantity: 10,
    maxRate: 7,
});

describe("getStdRequisitionTabIssues", () => {
    it("returns no issues when the requisition is readonly", () => {
        const result = getStdRequisitionTabIssues({
            draft: createDraft({
                collectionChargesBanksAndBins: [
                    createBanksAndBins({
                        isCollectionTypeActive: false,
                        isLocationActive: false,
                        miles: 999,
                    }),
                ],
                collectionVanPacks: [
                    createVanPack({
                        vanPacksOut: 999,
                    }),
                ],
                pickups: [
                    createPickup({
                        miles: 999,
                    }),
                ],
                transfers: [
                    createTransfer({
                        isShopFromActive: false,
                        isShopToActive: false,
                        miles: 999,
                    }),
                ],
                additionalCosts: [
                    createAdditionalCost({
                        isReasonActive: false,
                        miles: 999,
                    }),
                ],
            }),
            isReadonly: true,
            stdMileageLimitRule: undefined,
            stdFlatChargeLimitRule: undefined,
            stdVanPackLimitRule: undefined,
        });

        expect(result).toEqual({
            collectionChargesBanksAndBins: REQUISITION_TAB_ISSUE_SEVERITY.None,
            collectionVanPacks: REQUISITION_TAB_ISSUE_SEVERITY.None,
            pickups: REQUISITION_TAB_ISSUE_SEVERITY.None,
            transfers: REQUISITION_TAB_ISSUE_SEVERITY.None,
            additionalCosts: REQUISITION_TAB_ISSUE_SEVERITY.None,
        });
    });

    it("returns no issues when there are no child rows", () => {
        const result = getStdRequisitionTabIssues({
            draft: createDraft(),
            isReadonly: false,
            stdMileageLimitRule: undefined,
            stdFlatChargeLimitRule: undefined,
            stdVanPackLimitRule: undefined,
        });

        expect(result).toEqual({
            collectionChargesBanksAndBins: REQUISITION_TAB_ISSUE_SEVERITY.None,
            collectionVanPacks: REQUISITION_TAB_ISSUE_SEVERITY.None,
            pickups: REQUISITION_TAB_ISSUE_SEVERITY.None,
            transfers: REQUISITION_TAB_ISSUE_SEVERITY.None,
            additionalCosts: REQUISITION_TAB_ISSUE_SEVERITY.None,
        });
    });

    it("returns warnings for banks and bins inactive collection type and location rows", () => {
        const collectionTypeResult = getStdRequisitionTabIssues({
            draft: createDraft({
                collectionChargesBanksAndBins: [
                    createBanksAndBins({
                        isCollectionTypeActive: false,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        const locationResult = getStdRequisitionTabIssues({
            draft: createDraft({
                collectionChargesBanksAndBins: [
                    createBanksAndBins({
                        isLocationActive: false,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        expect(collectionTypeResult.collectionChargesBanksAndBins).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Warning,
        );
        expect(locationResult.collectionChargesBanksAndBins).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Warning,
        );
    });

    it("returns blockers for banks and bins rows with missing or invalid limits", () => {
        const missingLimitResult = getStdRequisitionTabIssues({
            draft: createDraft({
                collectionChargesBanksAndBins: [
                    createBanksAndBins(),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: undefined,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        const overLimitResult = getStdRequisitionTabIssues({
            draft: createDraft({
                collectionChargesBanksAndBins: [
                    createBanksAndBins({
                        miles: 21,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        expect(missingLimitResult.collectionChargesBanksAndBins).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
        );
        expect(overLimitResult.collectionChargesBanksAndBins).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
        );
    });

    it("returns blockers for van pack rows with missing or invalid limits", () => {
        const missingLimitResult = getStdRequisitionTabIssues({
            draft: createDraft({
                collectionVanPacks: [
                    createVanPack(),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: undefined,
        });

        const overLimitResult = getStdRequisitionTabIssues({
            draft: createDraft({
                collectionVanPacks: [
                    createVanPack({
                        vanPacksOut: 11,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        expect(missingLimitResult.collectionVanPacks).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
        );
        expect(overLimitResult.collectionVanPacks).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
        );
    });

    it("returns blockers for pickup rows with missing or invalid limits", () => {
        const missingLimitResult = getStdRequisitionTabIssues({
            draft: createDraft({
                pickups: [
                    createPickup(),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: undefined,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        const overLimitResult = getStdRequisitionTabIssues({
            draft: createDraft({
                pickups: [
                    createPickup({
                        ratePerMile: 0.46,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        expect(missingLimitResult.pickups).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
        );
        expect(overLimitResult.pickups).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
        );
    });

    it("returns warnings for inactive transfer shops", () => {
        const result = getStdRequisitionTabIssues({
            draft: createDraft({
                transfers: [
                    createTransfer({
                        isShopFromActive: false,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        expect(result.transfers).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Warning);
    });

    it("returns blockers for transfer rows with missing or invalid limits", () => {
        const result = getStdRequisitionTabIssues({
            draft: createDraft({
                transfers: [
                    createTransfer({
                        miles: 21,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        expect(result.transfers).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);
    });

    it("returns blocker when a tab has both historical warnings and limit blockers", () => {
        const result = getStdRequisitionTabIssues({
            draft: createDraft({
                transfers: [
                    createTransfer({
                        isShopFromActive: false,
                        miles: 21,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        expect(result.transfers).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);
    });

    it("returns warnings for inactive additional-cost reasons", () => {
        const result = getStdRequisitionTabIssues({
            draft: createDraft({
                additionalCosts: [
                    createAdditionalCost({
                        isReasonActive: false,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        expect(result.additionalCosts).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Warning,
        );
    });

    it("returns blockers for additional-cost rows with missing or invalid limits", () => {
        const result = getStdRequisitionTabIssues({
            draft: createDraft({
                additionalCosts: [
                    createAdditionalCost({
                        chargeType: STD_CHARGE_TYPE.FlatCharge,
                        miles: null,
                        ratePerMile: null,
                        flatCharge: 10.01,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        expect(result.additionalCosts).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
        );
    });

    it("returns no issues when all rows are clean and matching limit rules exist", () => {
        const result = getStdRequisitionTabIssues({
            draft: createDraft({
                collectionChargesBanksAndBins: [
                    createBanksAndBins({
                        miles: 20,
                        ratePerMile: 0.45,
                    }),
                ],
                collectionVanPacks: [
                    createVanPack({
                        vanPacksOut: 10,
                    }),
                ],
                pickups: [
                    createPickup({
                        miles: 20,
                        ratePerMile: 0.45,
                    }),
                ],
                transfers: [
                    createTransfer({
                        miles: 20,
                        ratePerMile: 0.45,
                    }),
                ],
                additionalCosts: [
                    createAdditionalCost({
                        chargeType: STD_CHARGE_TYPE.FlatCharge,
                        miles: null,
                        ratePerMile: null,
                        flatCharge: 10,
                    }),
                ],
            }),
            isReadonly: false,
            stdMileageLimitRule: mileageRule,
            stdFlatChargeLimitRule: flatChargeRule,
            stdVanPackLimitRule: vanPackRule,
        });

        expect(result).toEqual({
            collectionChargesBanksAndBins: REQUISITION_TAB_ISSUE_SEVERITY.None,
            collectionVanPacks: REQUISITION_TAB_ISSUE_SEVERITY.None,
            pickups: REQUISITION_TAB_ISSUE_SEVERITY.None,
            transfers: REQUISITION_TAB_ISSUE_SEVERITY.None,
            additionalCosts: REQUISITION_TAB_ISSUE_SEVERITY.None,
        });
    });
});