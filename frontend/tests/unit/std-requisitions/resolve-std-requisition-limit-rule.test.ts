import { describe, expect, it } from "vitest";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { STD_REQUISITION_ROW_CATEGORIES } from "@/features/std-requisitions/constants/std-requisition-row-categories";
import { resolveStdRequisitionLimitRule } from "@/features/std-requisitions/form/lib/resolve-std-requisition-limit-rule";
import { FASCIAS } from "@/lib/constants/fascias";

function createRule(
    overrides: Partial<RequisitionLimitRuleSummary> = {},
): RequisitionLimitRuleSummary {
    return {
        id: "rule-id",
        category: STD_REQUISITION_ROW_CATEGORIES.MILEAGE,
        categoryName: "Mileage",
        feTaskTypeId: null,
        feTaskTypeName: null,
        isFeTaskTypeActive: null,
        fascia: FASCIAS.STD,
        fasciaName: "STD",
        maxQuantity: 10,
        maxRate: 1,
        createdAtUtc: "2026-01-01T00:00:00Z",
        createdByNameSnapshot: "Created By",
        updatedAtUtc: null,
        updatedByNameSnapshot: null,
        ...overrides,
    };
}

describe("resolveStdRequisitionLimitRule", () => {
    it("returns the matching STD rule for the requested category", () => {
        const mileageRule = createRule({
            id: "std-mileage-rule",
            category: STD_REQUISITION_ROW_CATEGORIES.MILEAGE,
            categoryName: "Mileage",
        });

        const flatChargeRule = createRule({
            id: "std-flat-charge-rule",
            category: STD_REQUISITION_ROW_CATEGORIES.FLAT_CHARGE,
            categoryName: "Flat Charge",
        });

        const result = resolveStdRequisitionLimitRule({
            rules: [flatChargeRule, mileageRule],
            category: STD_REQUISITION_ROW_CATEGORIES.MILEAGE,
        });

        expect(result).toBe(mileageRule);
    });

    it("does not match FE rules for STD requisitions", () => {
        const feRule = createRule({
            id: "fe-mileage-rule",
            fascia: FASCIAS.FE,
            fasciaName: "FE",
            category: STD_REQUISITION_ROW_CATEGORIES.MILEAGE,
            categoryName: "Mileage",
        });

        const result = resolveStdRequisitionLimitRule({
            rules: [feRule],
            category: STD_REQUISITION_ROW_CATEGORIES.MILEAGE,
        });

        expect(result).toBeUndefined();
    });

    it("requires an exact category match", () => {
        const vanPackRule = createRule({
            id: "std-van-pack-rule",
            category: STD_REQUISITION_ROW_CATEGORIES.VAN_PACK,
            categoryName: "Van Pack",
        });

        const result = resolveStdRequisitionLimitRule({
            rules: [vanPackRule],
            category: STD_REQUISITION_ROW_CATEGORIES.FLAT_CHARGE,
        });

        expect(result).toBeUndefined();
    });

    it("ignores FE task-type-specific fields when resolving STD rules", () => {
        const stdRuleWithFeTaskTypeMetadata = createRule({
            id: "std-mileage-rule-with-fe-task-type-metadata",
            category: STD_REQUISITION_ROW_CATEGORIES.MILEAGE,
            categoryName: "Mileage",
            feTaskTypeId: "unexpected-fe-task-type-id",
            feTaskTypeName: "Unexpected FE Task Type",
            isFeTaskTypeActive: true,
        });

        const result = resolveStdRequisitionLimitRule({
            rules: [stdRuleWithFeTaskTypeMetadata],
            category: STD_REQUISITION_ROW_CATEGORIES.MILEAGE,
        });

        expect(result).toBe(stdRuleWithFeTaskTypeMetadata);
    });

    it("returns undefined when no matching STD rule exists", () => {
        const result = resolveStdRequisitionLimitRule({
            rules: [],
            category: STD_REQUISITION_ROW_CATEGORIES.VAN_PACK,
        });

        expect(result).toBeUndefined();
    });
});