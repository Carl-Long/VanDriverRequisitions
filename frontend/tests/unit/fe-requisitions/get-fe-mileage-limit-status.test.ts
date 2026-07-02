import { describe, expect, it } from "vitest";

import { REQUISITION_ROW_CATEGORIES } from "@/features/fe-requisitions/constants/requisition-row-categories";
import { getMileageLimitStatus } from "@/features/fe-requisitions/form/lib/get-fe-mileage-limit-status";
import type {
    FeMileageDraft,
    FeMileageQuantitiesDraft,
} from "@/features/fe-requisitions/form/types/fe-mileage-draft";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { FASCIAS } from "@/lib/constants/fascias";

function createQuantities(
    overrides: Partial<FeMileageQuantitiesDraft> = {},
): FeMileageQuantitiesDraft {
    return {
        sunday: 0,
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        ...overrides,
    };
}

function createMileage(
    overrides: Partial<FeMileageDraft> = {},
): FeMileageDraft {
    return {
        id: null,
        clientId: "mileage-client-id",
        weekEndingDate: new Date(2026, 5, 14),
        quantities: createQuantities(),
        totalMiles: 0,
        ratePerMile: 1,
        totalValue: 0,
        ...overrides,
    };
}

function createRule(
    overrides: Partial<RequisitionLimitRuleSummary> = {},
): RequisitionLimitRuleSummary {
    return {
        id: "mileage-limit-rule-id",
        category: REQUISITION_ROW_CATEGORIES.MILEAGE,
        categoryName: "Mileage",
        feTaskTypeId: null,
        feTaskTypeName: null,
        isFeTaskTypeActive: null,
        fascia: FASCIAS.FE,
        fasciaName: "FE",
        maxQuantity: 20,
        maxRate: 0.45,
        createdAtUtc: "2026-01-01T00:00:00Z",
        createdByNameSnapshot: "Created By",
        updatedAtUtc: null,
        updatedByNameSnapshot: null,
        ...overrides,
    };
}

describe("getMileageLimitStatus", () => {
    it("returns missing-limit when no mileage rule is configured", () => {
        const result = getMileageLimitStatus(createMileage());

        expect(result).toEqual({
            state: "missing-limit",
            messages: ["No mileage limit rule is configured."],
        });
    });

    it("returns ok when mileage quantities and rate are exactly on the configured limits", () => {
        const result = getMileageLimitStatus(
            createMileage({
                quantities: createQuantities({
                    sunday: 20,
                    monday: 20,
                    saturday: 20,
                }),
                ratePerMile: 0.45,
            }),
            createRule(),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("treats null quantities and null rate as clean values", () => {
        const result = getMileageLimitStatus(
            createMileage({
                quantities: createQuantities({
                    sunday: null,
                    monday: null,
                    tuesday: null,
                    wednesday: null,
                    thursday: null,
                    friday: null,
                    saturday: null,
                }),
                ratePerMile: null,
            }),
            createRule(),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("returns all mileage and rate limit messages when multiple values exceed the rule", () => {
        const result = getMileageLimitStatus(
            createMileage({
                quantities: createQuantities({
                    sunday: 21,
                    friday: 25,
                }),
                ratePerMile: 0.46,
            }),
            createRule(),
        );

        expect(result).toEqual({
            state: "exceeds-limit",
            messages: [
                "Sunday exceeds max mileage of 20.",
                "Friday exceeds max mileage of 20.",
                "Rate exceeds maximum of £0.45.",
            ],
        });
    });
});