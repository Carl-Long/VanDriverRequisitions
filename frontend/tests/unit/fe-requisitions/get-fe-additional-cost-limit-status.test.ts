import { describe, expect, it } from "vitest";

import { REQUISITION_ROW_CATEGORIES } from "@/features/fe-requisitions/constants/requisition-row-categories";
import { getFeAdditionalCostLimitStatus } from "@/features/fe-requisitions/form/lib/get-fe-additional-cost-limit-status";
import type { FeAdditionalCostDraft } from "@/features/fe-requisitions/form/types/fe-additional-cost-draft";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { FASCIAS } from "@/lib/constants/fascias";

function createAdditionalCost(
    overrides: Partial<FeAdditionalCostDraft> = {},
): FeAdditionalCostDraft {
    return {
        id: null,
        clientId: "additional-cost-client-id",

        weekEndingDate: new Date(2026, 5, 14),

        reasonId: "reason-id",
        reasonCode: "27302",
        reasonText: "Additional cost",
        isReasonActive: true,

        chargingOption: "Job",

        totalNumber: 0,
        ratePerJob: 1,

        miles: null,
        ratePerMile: null,

        totalValue: 0,

        ...overrides,
    };
}

function createAdditionalCostRule(
    overrides: Partial<RequisitionLimitRuleSummary> = {},
): RequisitionLimitRuleSummary {
    return {
        id: "additional-cost-limit-rule-id",
        category: REQUISITION_ROW_CATEGORIES.ADDITIONAL_COST,
        categoryName: "Additional Cost",
        feTaskTypeId: null,
        feTaskTypeName: null,
        isFeTaskTypeActive: null,
        fascia: FASCIAS.FE,
        fasciaName: "FE",
        maxQuantity: 3,
        maxRate: 10,
        createdAtUtc: "2026-01-01T00:00:00Z",
        createdByNameSnapshot: "Created By",
        updatedAtUtc: null,
        updatedByNameSnapshot: null,
        ...overrides,
    };
}

function createMileageRule(
    overrides: Partial<RequisitionLimitRuleSummary> = {},
): RequisitionLimitRuleSummary {
    return createAdditionalCostRule({
        id: "mileage-limit-rule-id",
        category: REQUISITION_ROW_CATEGORIES.MILEAGE,
        categoryName: "Mileage",
        maxQuantity: 20,
        maxRate: 0.45,
        ...overrides,
    });
}

describe("getFeAdditionalCostLimitStatus", () => {
    it("returns missing-limit when a job row has no additional-cost rule", () => {
        const result = getFeAdditionalCostLimitStatus(
            createAdditionalCost({
                chargingOption: "Job",
            }),
        );

        expect(result).toEqual({
            state: "missing-limit",
            messages: ["No additional cost limit rule is configured."],
        });
    });

    it("returns missing-limit when a mileage row has no mileage rule", () => {
        const result = getFeAdditionalCostLimitStatus(
            createAdditionalCost({
                chargingOption: "Mileage",
            }),
            createAdditionalCostRule(),
        );

        expect(result).toEqual({
            state: "missing-limit",
            messages: ["No mileage limit rule is configured."],
        });
    });

    it("returns ok for job rows when quantity and rate are exactly on the configured limits", () => {
        const result = getFeAdditionalCostLimitStatus(
            createAdditionalCost({
                chargingOption: "Job",
                totalNumber: 3,
                ratePerJob: 10,
            }),
            createAdditionalCostRule(),
            createMileageRule(),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("treats null job quantity and null job rate as clean values", () => {
        const result = getFeAdditionalCostLimitStatus(
            createAdditionalCost({
                chargingOption: "Job",
                totalNumber: null,
                ratePerJob: null,
            }),
            createAdditionalCostRule(),
            createMileageRule(),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("returns all job limit messages when quantity and rate exceed the rule", () => {
        const result = getFeAdditionalCostLimitStatus(
            createAdditionalCost({
                chargingOption: "Job",
                totalNumber: 4,
                ratePerJob: 10.01,
            }),
            createAdditionalCostRule(),
            createMileageRule(),
        );

        expect(result).toEqual({
            state: "exceeds-limit",
            messages: [
                "Quantity exceeds maximum of 3.",
                "Rate exceeds maximum of £10.00.",
            ],
        });
    });

    it("returns ok for mileage rows when miles and rate are exactly on the configured limits", () => {
        const result = getFeAdditionalCostLimitStatus(
            createAdditionalCost({
                chargingOption: "Mileage",
                miles: 20,
                ratePerMile: 0.45,
            }),
            createAdditionalCostRule(),
            createMileageRule(),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("treats null mileage values as clean values", () => {
        const result = getFeAdditionalCostLimitStatus(
            createAdditionalCost({
                chargingOption: "Mileage",
                miles: null,
                ratePerMile: null,
            }),
            createAdditionalCostRule(),
            createMileageRule(),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("returns all mileage limit messages when miles and rate exceed the mileage rule", () => {
        const result = getFeAdditionalCostLimitStatus(
            createAdditionalCost({
                chargingOption: "Mileage",
                miles: 21,
                ratePerMile: 0.46,
            }),
            createAdditionalCostRule(),
            createMileageRule(),
        );

        expect(result).toEqual({
            state: "exceeds-limit",
            messages: [
                "Miles exceed maximum of 20.",
                "Rate exceeds maximum of £0.45.",
            ],
        });
    });
});