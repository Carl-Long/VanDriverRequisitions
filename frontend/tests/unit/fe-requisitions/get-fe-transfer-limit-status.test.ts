import { describe, expect, it } from "vitest";

import { REQUISITION_ROW_CATEGORIES } from "@/features/fe-requisitions/constants/requisition-row-categories";
import { getFeTransferLimitStatus } from "@/features/fe-requisitions/form/lib/get-fe-transfer-limit-status";
import type { WeeklyQuantitiesDraft } from "@/features/fe-requisitions/form/types/fe-general-task-draft";
import type { FeTransferDraft } from "@/features/fe-requisitions/form/types/fe-transfer-draft";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { FASCIAS } from "@/lib/constants/fascias";

function createQuantities(
    overrides: Partial<WeeklyQuantitiesDraft> = {},
): WeeklyQuantitiesDraft {
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

function createTransfer(
    overrides: Partial<FeTransferDraft> = {},
): FeTransferDraft {
    return {
        id: null,
        clientId: "transfer-client-id",

        shopIdFrom: "from-shop-id",
        shopLabelFrom: "001 - From Shop",
        isShopFromActive: true,

        shopIdTo: "to-shop-id",
        shopLabelTo: "002 - To Shop",
        isShopToActive: true,

        weekEndingDate: new Date(2026, 5, 14),
        quantities: createQuantities(),

        totalNumber: 0,
        ratePerJob: 1,
        totalValue: 0,

        ...overrides,
    };
}

function createRule(
    overrides: Partial<RequisitionLimitRuleSummary> = {},
): RequisitionLimitRuleSummary {
    return {
        id: "transfer-limit-rule-id",
        category: REQUISITION_ROW_CATEGORIES.TRANSFER,
        categoryName: "Transfer",
        feTaskTypeId: null,
        feTaskTypeName: null,
        isFeTaskTypeActive: null,
        fascia: FASCIAS.FE,
        fasciaName: "FE",
        maxQuantity: 5,
        maxRate: 2,
        createdAtUtc: "2026-01-01T00:00:00Z",
        createdByNameSnapshot: "Created By",
        updatedAtUtc: null,
        updatedByNameSnapshot: null,
        ...overrides,
    };
}

describe("getFeTransferLimitStatus", () => {
    it("returns missing-limit when no transfer rule is configured", () => {
        const result = getFeTransferLimitStatus(createTransfer());

        expect(result).toEqual({
            state: "missing-limit",
            messages: ["No transfer limit rule is configured."],
        });
    });

    it("returns ok when quantities and rate are exactly on the configured limits", () => {
        const result = getFeTransferLimitStatus(
            createTransfer({
                quantities: createQuantities({
                    sunday: 5,
                    monday: 5,
                    saturday: 5,
                }),
                ratePerJob: 2,
            }),
            createRule(),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("treats null quantities and null rate as clean values", () => {
        const result = getFeTransferLimitStatus(
            createTransfer({
                quantities: createQuantities({
                    sunday: null,
                    monday: null,
                    tuesday: null,
                    wednesday: null,
                    thursday: null,
                    friday: null,
                    saturday: null,
                }),
                ratePerJob: null,
            }),
            createRule(),
        );

        expect(result).toEqual({
            state: "ok",
            messages: [],
        });
    });

    it("returns all quantity and rate messages when multiple values exceed the rule", () => {
        const result = getFeTransferLimitStatus(
            createTransfer({
                quantities: createQuantities({
                    sunday: 6,
                    friday: 7,
                }),
                ratePerJob: 2.01,
            }),
            createRule(),
        );

        expect(result).toEqual({
            state: "exceeds-limit",
            messages: [
                "Sunday exceeds max quantity of 5.",
                "Friday exceeds max quantity of 5.",
                "Rate exceeds maximum of £2.00.",
            ],
        });
    });
});