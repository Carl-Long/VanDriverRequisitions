import { describe, expect, it } from "vitest";

import { REQUISITION_ROW_CATEGORIES } from "@/features/fe-requisitions/constants/requisition-row-categories";
import { resolveFeRequisitionLimitRule } from "@/features/fe-requisitions/form/lib/resolve-fe-requisition-limit-rule";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { FASCIAS } from "@/lib/constants/fascias";

function createRule(
    overrides: Partial<RequisitionLimitRuleSummary> = {},
): RequisitionLimitRuleSummary {
    return {
        id: "rule-id",
        category: REQUISITION_ROW_CATEGORIES.MILEAGE,
        categoryName: "Mileage",
        feTaskTypeId: null,
        feTaskTypeName: null,
        isFeTaskTypeActive: null,
        fascia: FASCIAS.FE,
        fasciaName: "FE",
        maxQuantity: 10,
        maxRate: 1,
        createdAtUtc: "2026-01-01T00:00:00Z",
        createdByNameSnapshot: "Created By",
        updatedAtUtc: null,
        updatedByNameSnapshot: null,
        ...overrides,
    };
}

describe("resolveFeRequisitionLimitRule", () => {
    it("returns an exact FE task-type-specific rule before a generic FE category rule", () => {
        const genericRule = createRule({
            id: "generic-mileage-rule",
            category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
            categoryName: "General Task",
            feTaskTypeId: null,
            maxRate: 1,
        });

        const taskTypeRule = createRule({
            id: "task-type-rule",
            category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
            categoryName: "General Task",
            feTaskTypeId: "task-type-id",
            feTaskTypeName: "Collections",
            isFeTaskTypeActive: true,
            maxRate: 2,
        });

        const result = resolveFeRequisitionLimitRule({
            rules: [genericRule, taskTypeRule],
            category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
            taskTypeId: "task-type-id",
        });

        expect(result).toBe(taskTypeRule);
    });

    it("falls back to the generic FE category rule when no matching task-type-specific rule exists", () => {
        const genericRule = createRule({
            id: "generic-general-task-rule",
            category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
            categoryName: "General Task",
            feTaskTypeId: null,
        });

        const otherTaskTypeRule = createRule({
            id: "other-task-type-rule",
            category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
            categoryName: "General Task",
            feTaskTypeId: "other-task-type-id",
        });

        const result = resolveFeRequisitionLimitRule({
            rules: [otherTaskTypeRule, genericRule],
            category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
            taskTypeId: "missing-task-type-id",
        });

        expect(result).toBe(genericRule);
    });

    it("returns the generic FE category rule when no task type is supplied", () => {
        const genericRule = createRule({
            id: "generic-mileage-rule",
            category: REQUISITION_ROW_CATEGORIES.MILEAGE,
            categoryName: "Mileage",
            feTaskTypeId: null,
        });

        const result = resolveFeRequisitionLimitRule({
            rules: [genericRule],
            category: REQUISITION_ROW_CATEGORIES.MILEAGE,
        });

        expect(result).toBe(genericRule);
    });

    it("does not match STD rules for FE requisitions", () => {
        const stdRule = createRule({
            id: "std-mileage-rule",
            fascia: FASCIAS.STD,
            fasciaName: "STD",
            category: REQUISITION_ROW_CATEGORIES.MILEAGE,
            categoryName: "Mileage",
        });

        const result = resolveFeRequisitionLimitRule({
            rules: [stdRule],
            category: REQUISITION_ROW_CATEGORIES.MILEAGE,
        });

        expect(result).toBeUndefined();
    });

    it("requires an exact category match", () => {
        const transferRule = createRule({
            id: "transfer-rule",
            category: REQUISITION_ROW_CATEGORIES.TRANSFER,
            categoryName: "Transfer",
        });

        const result = resolveFeRequisitionLimitRule({
            rules: [transferRule],
            category: REQUISITION_ROW_CATEGORIES.MILEAGE,
        });

        expect(result).toBeUndefined();
    });

    it("returns undefined when no matching FE rule exists", () => {
        const result = resolveFeRequisitionLimitRule({
            rules: [],
            category: REQUISITION_ROW_CATEGORIES.ADDITIONAL_COST,
        });

        expect(result).toBeUndefined();
    });
});