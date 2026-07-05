import { describe, expect, it } from "vitest";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { STD_CHARGE_TYPE } from "@/features/std-requisitions/constants/std-charge-type.constants";
import { STD_REQUISITION_ROW_CATEGORIES } from "@/features/std-requisitions/constants/std-requisition-row-categories";
import { createStdAdditionalCostFormSchema } from "@/features/std-requisitions/form/schemas/create-std-additional-cost-form-schema";
import { createStdCollectionChargeBanksAndBinsFormSchema } from "@/features/std-requisitions/form/schemas/create-std-collection-charge-banks-and-bins-form-schema";
import { createStdCollectionVanPackFormSchema } from "@/features/std-requisitions/form/schemas/create-std-collection-van-pack-form-schema";
import { createStdPickupFormSchema } from "@/features/std-requisitions/form/schemas/create-std-pickup-form-schema";
import { createStdTransferFormSchema } from "@/features/std-requisitions/form/schemas/create-std-transfer-form-schema";
import { stdRequisitionSchema } from "@/features/std-requisitions/form/schemas/std-requisition-schema";
import { FASCIAS } from "@/lib/constants/fascias";

type ValidationIssue = {
    path: readonly PropertyKey[];
    message: string;
};

function getErrors(issues: readonly ValidationIssue[]): Record<string, string[]> {
    return issues.reduce<Record<string, string[]>>((errors, issue) => {
        const key =
            issue.path.length > 0
                ? issue.path.map(String).join(".")
                : "form";

        errors[key] ??= [];
        errors[key].push(issue.message);

        return errors;
    }, {});
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

const mileageLimitRule = createRule();

const flatChargeLimitRule = createRule({
    id: "std-flat-charge-limit-rule-id",
    category: STD_REQUISITION_ROW_CATEGORIES.FLAT_CHARGE,
    categoryName: "Flat Charge",
    maxQuantity: 1,
    maxRate: 10,
});

const vanPackLimitRule = createRule({
    id: "std-van-pack-limit-rule-id",
    category: STD_REQUISITION_ROW_CATEGORIES.VAN_PACK,
    categoryName: "Van Pack",
    maxQuantity: 10,
    maxRate: 7,
});

const chargeRules = {
    mileageLimitRule,
    flatChargeLimitRule,
};

function createPickupForm(overrides: Record<string, unknown> = {}) {
    return {
        date: new Date(2026, 5, 14),
        numberOfBags: 1,
        numberOfHouseholds: 1,
        chargeType: STD_CHARGE_TYPE.Mileage,
        miles: 10,
        ratePerMile: 0.45,
        flatCharge: null,
        ...overrides,
    };
}

function createTransferForm(overrides: Record<string, unknown> = {}) {
    return {
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
        miles: 10,
        ratePerMile: 0.45,
        flatCharge: null,

        ...overrides,
    };
}

function createBanksAndBinsForm(overrides: Record<string, unknown> = {}) {
    return {
        date: new Date(2026, 5, 14),

        collectionTypeId: "collection-type-id",
        collectionTypeLabel: "Banks",
        collectionTypeCode: "BANKS",
        isCollectionTypeActive: true,

        locationId: "location-id",
        locationLabel: "Location",
        locationPostCode: "AB1 2CD",
        isLocationActive: true,
        isLocationLinkedToRequisitionShop: true,
        isLocationLinkedToCollectionType: true,

        numberOfBags: 1,

        chargeType: STD_CHARGE_TYPE.Mileage,
        miles: 10,
        ratePerMile: 0.45,
        flatCharge: null,

        ...overrides,
    };
}

function createVanPackForm(overrides: Record<string, unknown> = {}) {
    return {
        deliveryDate: new Date(2026, 5, 14),
        postCodeZone: "SW1A",
        vanPacksOut: 10,
        filledBags: 5,
        ...overrides,
    };
}

function createAdditionalCostForm(overrides: Record<string, unknown> = {}) {
    return {
        date: new Date(2026, 5, 14),

        reasonId: "reason-id",
        reasonCode: "27302",
        reasonText: "Additional cost",
        isReasonActive: true,

        numberOfBags: 1,

        chargeType: STD_CHARGE_TYPE.Mileage,
        miles: 10,
        ratePerMile: 0.45,
        flatCharge: null,

        ...overrides,
    };
}

describe("stdRequisitionSchema", () => {
    it("rejects missing required header fields", () => {
        const result = stdRequisitionSchema.safeParse({
            requisitionDate: null,
            vanDriverId: null,
            vanDriverName: "",
            shopId: null,
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            pickups: [],
            transfers: [],
            additionalCosts: [],
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                requisitionDate: ["Requisition date is required"],
                vanDriverId: ["Van driver is required"],
                vanDriverName: ["Van driver name is required"],
                shopId: ["Shop is required"],
            });
        }
    });

    it("rejects a valid header with no requisition rows", () => {
        const result = stdRequisitionSchema.safeParse({
            requisitionDate: new Date(2026, 5, 14),
            vanDriverId: "van-driver-id",
            vanDriverName: "Van Driver",
            shopId: "shop-id",
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            pickups: [],
            transfers: [],
            additionalCosts: [],
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                form: ["At least one requisition row is required"],
            });
        }
    });

    it("accepts valid header fields when at least one child row exists", () => {
        const result = stdRequisitionSchema.safeParse({
            requisitionDate: new Date(2026, 5, 14),
            vanDriverId: "van-driver-id",
            vanDriverName: "Van Driver",
            shopId: "shop-id",
            collectionChargesBanksAndBins: [],
            collectionVanPacks: [],
            pickups: [{}],
            transfers: [],
            additionalCosts: [],
        });

        expect(result.success).toBe(true);
    });
});

describe("createStdPickupFormSchema", () => {
    it("accepts valid mileage and flat-charge pickup forms", () => {
        const schema = createStdPickupFormSchema(chargeRules);

        expect(schema.safeParse(createPickupForm()).success).toBe(true);

        expect(
            schema.safeParse(
                createPickupForm({
                    chargeType: STD_CHARGE_TYPE.FlatCharge,
                    miles: null,
                    ratePerMile: null,
                    flatCharge: 10,
                }),
            ).success,
        ).toBe(true);
    });

    it("rejects missing counts, missing mileage fields, conflicting flat charge, and missing mileage limit rule", () => {
        const result = createStdPickupFormSchema({
            flatChargeLimitRule,
        }).safeParse(
            createPickupForm({
                numberOfBags: null,
                numberOfHouseholds: null,
                miles: null,
                ratePerMile: null,
                flatCharge: 10,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                numberOfBags: ["Bags are required"],
                numberOfHouseholds: ["Households are required"],
                miles: ["Miles are required"],
                ratePerMile: ["Rate per mile is required"],
                form: [
                    "Flat charge must be empty for mileage charges",
                    "No STD mileage limit rule is configured. Please contact an administrator.",
                ],
            });
        }
    });

    it("rejects over-limit mileage values and invalid money precision", () => {
        const result = createStdPickupFormSchema(chargeRules).safeParse(
            createPickupForm({
                miles: 21,
                ratePerMile: 0.456,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                miles: ["Maximum mileage of 20 exceeded"],
                ratePerMile: [
                    "Rate per mile can have a maximum of 2 decimal places",
                    "Maximum rate of £0.45 exceeded",
                ],
            });
        }
    });

    it("rejects flat-charge rows with mileage fields and missing flat-charge limit rule", () => {
        const result = createStdPickupFormSchema({
            mileageLimitRule,
        }).safeParse(
            createPickupForm({
                chargeType: STD_CHARGE_TYPE.FlatCharge,
                miles: 10,
                ratePerMile: 0.45,
                flatCharge: 10.01,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                form: [
                    "Mileage fields must be empty for flat charges",
                    "No STD flat charge limit rule is configured. Please contact an administrator.",
                ],
            });
        }
    });
});

describe("createStdTransferFormSchema", () => {
    it("accepts a valid transfer form", () => {
        const result = createStdTransferFormSchema(chargeRules).safeParse(
            createTransferForm(),
        );

        expect(result.success).toBe(true);
    });

    it("rejects missing shops and same-shop transfers", () => {
        const schema = createStdTransferFormSchema(chargeRules);

        const missingShopResult = schema.safeParse(
            createTransferForm({
                shopIdFrom: null,
                shopIdTo: null,
            }),
        );

        expect(missingShopResult.success).toBe(false);

        if (!missingShopResult.success) {
            expect(getErrors(missingShopResult.error.issues)).toMatchObject({
                shopIdFrom: ["From shop is required"],
                shopIdTo: ["To shop is required"],
            });
        }

        const sameShopResult = schema.safeParse(
            createTransferForm({
                shopIdFrom: "same-shop-id",
                shopIdTo: "same-shop-id",
            }),
        );

        expect(sameShopResult.success).toBe(false);

        if (!sameShopResult.success) {
            expect(getErrors(sameShopResult.error.issues)).toMatchObject({
                shopIdTo: ["From shop and to shop must be different"],
            });
        }
    });
});

describe("createStdCollectionChargeBanksAndBinsFormSchema", () => {
    it("accepts a valid banks-and-bins form", () => {
        const result = createStdCollectionChargeBanksAndBinsFormSchema(
            chargeRules,
        ).safeParse(createBanksAndBinsForm());

        expect(result.success).toBe(true);
    });

    it("rejects missing collection type and location", () => {
        const result = createStdCollectionChargeBanksAndBinsFormSchema(
            chargeRules,
        ).safeParse(
            createBanksAndBinsForm({
                collectionTypeId: null,
                locationId: null,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                collectionTypeId: ["Collection type is required"],
                locationId: ["Location is required"],
            });
        }
    });

    it("preserves banks and bins location relationship flags when parsing a valid row", () => {
        const schema = createStdCollectionChargeBanksAndBinsFormSchema({
            mileageLimitRule,
            flatChargeLimitRule,
        });

        const row = createBanksAndBinsForm({
            isLocationLinkedToRequisitionShop: false,
            isLocationLinkedToCollectionType: false,
        });

        const result = schema.safeParse(row);

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.isLocationLinkedToRequisitionShop).toBe(false);
            expect(result.data.isLocationLinkedToCollectionType).toBe(false);
        }
    });
});

describe("createStdCollectionVanPackFormSchema", () => {
    it("accepts a valid van pack form", () => {
        const result = createStdCollectionVanPackFormSchema(
            vanPackLimitRule,
        ).safeParse(createVanPackForm());

        expect(result.success).toBe(true);
    });

    it("rejects invalid postcode zone, missing pricing rule, and invalid counts", () => {
        const result = createStdCollectionVanPackFormSchema().safeParse(
            createVanPackForm({
                postCodeZone: "not a postcode zone",
                vanPacksOut: 0,
                filledBags: 0,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                postCodeZone: ["Enter a valid postcode zone, for example M1, B33 or SW1A"],
                vanPacksOut: ["Van packs out must be greater than zero"],
                filledBags: ["Filled bags must be greater than zero"],
                form: [
                    "No STD van pack pricing rule is configured. Please contact an administrator.",
                ],
            });
        }
    });

    it("rejects over-limit van packs out and filled bags greater than van packs out", () => {
        const result = createStdCollectionVanPackFormSchema(
            vanPackLimitRule,
        ).safeParse(
            createVanPackForm({
                vanPacksOut: 11,
                filledBags: 12,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                vanPacksOut: ["Maximum van packs out of 10 exceeded"],
                filledBags: ["Filled bags cannot be greater than van packs out"],
            });
        }
    });
});

describe("createStdAdditionalCostFormSchema", () => {
    it("accepts valid mileage and flat-charge additional cost forms", () => {
        const schema = createStdAdditionalCostFormSchema(chargeRules);

        expect(schema.safeParse(createAdditionalCostForm()).success).toBe(true);

        expect(
            schema.safeParse(
                createAdditionalCostForm({
                    chargeType: STD_CHARGE_TYPE.FlatCharge,
                    miles: null,
                    ratePerMile: null,
                    flatCharge: 10,
                }),
            ).success,
        ).toBe(true);
    });

    it("rejects missing reason, missing number of bags, and missing mileage fields", () => {
        const result = createStdAdditionalCostFormSchema(chargeRules).safeParse(
            createAdditionalCostForm({
                reasonId: null,
                numberOfBags: null,
                miles: null,
                ratePerMile: null,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                reasonId: ["Reason is required"],
                numberOfBags: ["Number of bags is required"],
                miles: ["Miles are required"],
                ratePerMile: ["Rate per mile is required"],
            });
        }
    });

    it("rejects over-limit flat charges with formatted currency", () => {
        const result = createStdAdditionalCostFormSchema(chargeRules).safeParse(
            createAdditionalCostForm({
                chargeType: STD_CHARGE_TYPE.FlatCharge,
                miles: null,
                ratePerMile: null,
                flatCharge: 10.01,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                flatCharge: ["Maximum flat charge of £10.00 exceeded"],
            });
        }
    });
});