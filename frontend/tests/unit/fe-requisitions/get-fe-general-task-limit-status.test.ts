import { describe, expect, it } from "vitest";

import { REQUISITION_ROW_CATEGORIES } from "@/features/fe-requisitions/constants/requisition-row-categories";
import { getGeneralTaskLimitStatus } from "@/features/fe-requisitions/form/lib/get-fe-general-task-limit-status";
import type {
    FeGeneralTaskDraft,
    WeeklyQuantitiesDraft,
} from "@/features/fe-requisitions/form/types/fe-general-task-draft";
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

function createTask(
    overrides: Partial<FeGeneralTaskDraft> = {},
): FeGeneralTaskDraft {
    return {
        id: null,
        clientId: "general-task-client-id",
        taskTypeId: "task-type-id",
        taskTypeLabel: "2389 - Collections",
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
        id: "general-task-limit-rule-id",
        category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
        categoryName: "General Task",
        feTaskTypeId: "task-type-id",
        feTaskTypeName: "Collections",
        isFeTaskTypeActive: true,
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

describe("getGeneralTaskLimitStatus", () => {
    it("returns missing-limit when no rule is configured", () => {
        const result = getGeneralTaskLimitStatus(createTask());

        expect(result).toEqual({
            state: "missing-limit",
            messages: ["No limit rule is configured for this item."],
        });
    });

    it("returns ok when quantities and rate are exactly on the configured limits", () => {
        const result = getGeneralTaskLimitStatus(
            createTask({
                quantities: createQuantities({
                    sunday: 5,
                    monday: 5,
                    saturday: 5,
                }),
                ratePerJob: 2,
            }),
            createRule(),
        );

        expect(result).toEqual({ state: "ok" });
    });

    it("treats null quantities and null rate as clean values", () => {
        const result = getGeneralTaskLimitStatus(
            createTask({
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

        expect(result).toEqual({ state: "ok" });
    });

    it("returns all quantity and rate limit messages when multiple values exceed the rule", () => {
        const result = getGeneralTaskLimitStatus(
            createTask({
                quantities: createQuantities({
                    sunday: 6,
                    thursday: 7,
                }),
                ratePerJob: 2.01,
            }),
            createRule(),
        );

        expect(result).toEqual({
            state: "exceeds-limit",
            messages: [
                "Sunday exceeds max quantity of 5.",
                "Thursday exceeds max quantity of 5.",
                "Rate exceeds maximum of £2.00.",
            ],
        });
    });
});