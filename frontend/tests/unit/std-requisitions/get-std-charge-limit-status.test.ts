import { describe, expect, it } from "vitest";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { STD_CHARGE_TYPE } from "@/features/std-requisitions/constants/std-charge-type.constants";
import { STD_REQUISITION_ROW_CATEGORIES } from "@/features/std-requisitions/constants/std-requisition-row-categories";
import { getStdChargeLimitStatus } from "@/features/std-requisitions/form/lib/get-std-charge-limit-status";
import type { StdChargeFields } from "@/features/std-requisitions/form/types/std-charge-fields";
import { FASCIAS } from "@/lib/constants/fascias";

function createChargeFields(
    overrides: Partial<StdChargeFields> = {},
): StdChargeFields {
    return {
        chargeType: STD_CHARGE_TYPE.Mileage,
        miles: 0,
        ratePerMile: 0,
        flatCharge: null,
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

describe("getStdChargeLimitStatus", () => {
    it("returns missing-limit when a mileage row has no mileage rule", () => {
        const result = getStdChargeLimitStatus(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.Mileage,
            }),
        );

        expect(result).toEqual({
            state: "missing-limit",
            messages: ["No STD mileage limit rule is configured."],
        });
    });

    it("returns missing-limit when a flat-charge row has no flat-charge rule", () => {
        const result = getStdChargeLimitStatus(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.FlatCharge,
            }),
            createRule(),
        );

        expect(result).toEqual({
            state: "missing-limit",
            messages: ["No STD flat charge limit rule is configured."],
        });
    });

    it("returns ok for mileage when miles and rate are exactly on the configured limits", () => {
        const mileageRule = createRule({
            maxQuantity: 20,
            maxRate: 0.45,
        });

        const result = getStdChargeLimitStatus(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.Mileage,
                miles: 20,
                ratePerMile: 0.45,
            }),
            mileageRule,
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("treats null mileage values as clean values", () => {
        const result = getStdChargeLimitStatus(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.Mileage,
                miles: null,
                ratePerMile: null,
            }),
            createRule(),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("returns all mileage limit messages when miles and rate exceed the rule", () => {
        const result = getStdChargeLimitStatus(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.Mileage,
                miles: 21,
                ratePerMile: 0.46,
            }),
            createRule({
                maxQuantity: 20,
                maxRate: 0.45,
            }),
        );

        expect(result).toEqual({
            state: "exceeds-limit",
            messages: [
                "Miles exceed maximum of 20.",
                "Rate per mile exceeds maximum of £0.45.",
            ],
        });
    });

    it("returns ok for flat charge when the value is exactly on the configured limit", () => {
        const flatChargeRule = createRule({
            category: STD_REQUISITION_ROW_CATEGORIES.FLAT_CHARGE,
            categoryName: "Flat Charge",
            maxRate: 10,
        });

        const result = getStdChargeLimitStatus(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.FlatCharge,
                flatCharge: 10,
            }),
            createRule(),
            flatChargeRule,
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("treats a null flat charge as a clean value", () => {
        const flatChargeRule = createRule({
            category: STD_REQUISITION_ROW_CATEGORIES.FLAT_CHARGE,
            categoryName: "Flat Charge",
            maxRate: 10,
        });

        const result = getStdChargeLimitStatus(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.FlatCharge,
                flatCharge: null,
            }),
            createRule(),
            flatChargeRule,
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("returns an over-limit message when flat charge exceeds the rule", () => {
        const flatChargeRule = createRule({
            category: STD_REQUISITION_ROW_CATEGORIES.FLAT_CHARGE,
            categoryName: "Flat Charge",
            maxRate: 10,
        });

        const result = getStdChargeLimitStatus(
            createChargeFields({
                chargeType: STD_CHARGE_TYPE.FlatCharge,
                flatCharge: 10.01,
            }),
            createRule(),
            flatChargeRule,
        );

        expect(result).toEqual({
            state: "exceeds-limit",
            messages: ["Flat charge exceeds maximum of £10.00."],
        });
    });
});