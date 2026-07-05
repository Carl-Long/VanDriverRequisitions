import { describe, expect, it } from "vitest";

import { REQUISITION_ROW_CATEGORIES } from "@/features/fe-requisitions/constants/requisition-row-categories";
import { getFeRequisitionTabIssues } from "@/features/fe-requisitions/form/lib/get-fe-requisition-tab-issues";
import type { FeAdditionalCostDraft } from "@/features/fe-requisitions/form/types/fe-additional-cost-draft";
import type {
    FeGeneralTaskDraft,
    WeeklyQuantitiesDraft,
} from "@/features/fe-requisitions/form/types/fe-general-task-draft";
import type { FeMileageDraft } from "@/features/fe-requisitions/form/types/fe-mileage-draft";
import type { FeRequisitionDraft } from "@/features/fe-requisitions/form/types/fe-requisition-draft";
import type { FeTransferDraft } from "@/features/fe-requisitions/form/types/fe-transfer-draft";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { REQUISITION_TAB_ISSUE_SEVERITY } from "@/features/requisitions-shared/types/requisition-tab-issue-severity";
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

function createGeneralTask(
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

function createMileage(
    overrides: Partial<FeMileageDraft> = {},
): FeMileageDraft {
    return {
        id: null,
        clientId: "mileage-client-id",
        weekEndingDate: new Date(2026, 5, 14),
        quantities: createQuantities(),
        totalMiles: 0,
        ratePerMile: 0.45,
        totalValue: 0,
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

function createDraft(
    overrides: Partial<FeRequisitionDraft> = {},
): FeRequisitionDraft {
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

        feGeneralTasks: [],
        feMileages: [],
        feTransfers: [],
        feAdditionalCosts: [],
        submissionHistory: [],

        ...overrides,
    };
}

function createRule(
    overrides: Partial<RequisitionLimitRuleSummary> = {},
): RequisitionLimitRuleSummary {
    return {
        id: "limit-rule-id",
        category: REQUISITION_ROW_CATEGORIES.MILEAGE,
        categoryName: "Mileage",
        feTaskTypeId: null,
        feTaskTypeName: null,
        isFeTaskTypeActive: null,
        fascia: FASCIAS.FE,
        fasciaName: "FE",
        maxQuantity: 10,
        maxRate: 2,
        createdAtUtc: "2026-01-01T00:00:00Z",
        createdByNameSnapshot: "Created By",
        updatedAtUtc: null,
        updatedByNameSnapshot: null,
        ...overrides,
    };
}

function createCleanLimitRules(): RequisitionLimitRuleSummary[] {
    return [
        createRule({
            id: "general-task-limit-rule-id",
            category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
            categoryName: "General Task",
            feTaskTypeId: "task-type-id",
            feTaskTypeName: "Collections",
            isFeTaskTypeActive: true,
            maxQuantity: 10,
            maxRate: 2,
        }),
        createRule({
            id: "mileage-limit-rule-id",
            category: REQUISITION_ROW_CATEGORIES.MILEAGE,
            categoryName: "Mileage",
            maxQuantity: 20,
            maxRate: 0.45,
        }),
        createRule({
            id: "transfer-limit-rule-id",
            category: REQUISITION_ROW_CATEGORIES.TRANSFER,
            categoryName: "Transfer",
            maxQuantity: 10,
            maxRate: 2,
        }),
        createRule({
            id: "additional-cost-limit-rule-id",
            category: REQUISITION_ROW_CATEGORIES.ADDITIONAL_COST,
            categoryName: "Additional Cost",
            maxQuantity: 5,
            maxRate: 10,
        }),
    ];
}

describe("getFeRequisitionTabIssues", () => {
    it("returns no issues when the requisition is readonly", () => {
        const result = getFeRequisitionTabIssues({
            draft: createDraft({
                feGeneralTasks: [
                    createGeneralTask({
                        quantities: createQuantities({ sunday: 999 }),
                    }),
                ],
                feMileages: [
                    createMileage({
                        quantities: createQuantities({ sunday: 999 }),
                    }),
                ],
                feTransfers: [
                    createTransfer({
                        isShopFromActive: false,
                    }),
                ],
                feAdditionalCosts: [
                    createAdditionalCost({
                        isReasonActive: false,
                    }),
                ],
            }),
            isReadonly: true,
            limitRules: [],
        });

        expect(result.getTaskTypeTabIssueSeverity("task-type-id")).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.None,
        );
        expect(result.mileage).toBe(REQUISITION_TAB_ISSUE_SEVERITY.None);
        expect(result.transfers).toBe(REQUISITION_TAB_ISSUE_SEVERITY.None);
        expect(result.additionalCosts).toBe(REQUISITION_TAB_ISSUE_SEVERITY.None);
    });

    it("returns blocker for a general task tab when matching rows have missing or invalid limits", () => {
        const result = getFeRequisitionTabIssues({
            draft: createDraft({
                feGeneralTasks: [
                    createGeneralTask({
                        taskTypeId: "task-type-id",
                    }),
                ],
            }),
            isReadonly: false,
            limitRules: [],
        });

        expect(result.getTaskTypeTabIssueSeverity("task-type-id")).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
        );
        expect(result.getTaskTypeTabIssueSeverity("other-task-type-id")).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.None,
        );
    });

    it("returns blocker for mileage rows with missing or invalid limits", () => {
        const result = getFeRequisitionTabIssues({
            draft: createDraft({
                feMileages: [
                    createMileage(),
                ],
            }),
            isReadonly: false,
            limitRules: [],
        });

        expect(result.mileage).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);
    });

    it("returns warning for inactive transfer shops", () => {
        const result = getFeRequisitionTabIssues({
            draft: createDraft({
                feTransfers: [
                    createTransfer({
                        isShopToActive: false,
                    }),
                ],
            }),
            isReadonly: false,
            limitRules: createCleanLimitRules(),
        });

        expect(result.transfers).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Warning);
    });

    it("returns blocker for transfer rows with missing or invalid limits", () => {
        const result = getFeRequisitionTabIssues({
            draft: createDraft({
                feTransfers: [
                    createTransfer({
                        quantities: createQuantities({
                            sunday: 11,
                        }),
                    }),
                ],
            }),
            isReadonly: false,
            limitRules: createCleanLimitRules(),
        });

        expect(result.transfers).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);
    });

    it("returns blocker when a transfer tab has both historical warnings and limit blockers", () => {
        const result = getFeRequisitionTabIssues({
            draft: createDraft({
                feTransfers: [
                    createTransfer({
                        isShopToActive: false,
                        quantities: createQuantities({
                            sunday: 11,
                        }),
                    }),
                ],
            }),
            isReadonly: false,
            limitRules: createCleanLimitRules(),
        });

        expect(result.transfers).toBe(REQUISITION_TAB_ISSUE_SEVERITY.Blocker);
    });

    it("returns warning for inactive additional-cost reasons", () => {
        const result = getFeRequisitionTabIssues({
            draft: createDraft({
                feAdditionalCosts: [
                    createAdditionalCost({
                        isReasonActive: false,
                    }),
                ],
            }),
            isReadonly: false,
            limitRules: createCleanLimitRules(),
        });

        expect(result.additionalCosts).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Warning,
        );
    });

    it("returns blocker for additional-cost rows with missing or invalid limits", () => {
        const result = getFeRequisitionTabIssues({
            draft: createDraft({
                feAdditionalCosts: [
                    createAdditionalCost({
                        chargingOption: "Job",
                        totalNumber: 6,
                        ratePerJob: 10,
                    }),
                ],
            }),
            isReadonly: false,
            limitRules: createCleanLimitRules(),
        });

        expect(result.additionalCosts).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.Blocker,
        );
    });

    it("returns no issues when all rows are clean and matching limit rules exist", () => {
        const result = getFeRequisitionTabIssues({
            draft: createDraft({
                feGeneralTasks: [
                    createGeneralTask({
                        quantities: createQuantities({
                            sunday: 10,
                        }),
                        ratePerJob: 2,
                    }),
                ],
                feMileages: [
                    createMileage({
                        quantities: createQuantities({
                            sunday: 20,
                        }),
                        ratePerMile: 0.45,
                    }),
                ],
                feTransfers: [
                    createTransfer({
                        quantities: createQuantities({
                            sunday: 10,
                        }),
                        ratePerJob: 2,
                    }),
                ],
                feAdditionalCosts: [
                    createAdditionalCost({
                        chargingOption: "Job",
                        totalNumber: 5,
                        ratePerJob: 10,
                    }),
                    createAdditionalCost({
                        chargingOption: "Mileage",
                        miles: 20,
                        ratePerMile: 0.45,
                    }),
                ],
            }),
            isReadonly: false,
            limitRules: createCleanLimitRules(),
        });

        expect(result.getTaskTypeTabIssueSeverity("task-type-id")).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.None,
        );
        expect(result.getTaskTypeTabIssueSeverity("other-task-type-id")).toBe(
            REQUISITION_TAB_ISSUE_SEVERITY.None,
        );
        expect(result.mileage).toBe(REQUISITION_TAB_ISSUE_SEVERITY.None);
        expect(result.transfers).toBe(REQUISITION_TAB_ISSUE_SEVERITY.None);
        expect(result.additionalCosts).toBe(REQUISITION_TAB_ISSUE_SEVERITY.None);
    });
});