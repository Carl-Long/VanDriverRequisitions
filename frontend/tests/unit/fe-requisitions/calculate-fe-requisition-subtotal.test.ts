import { describe, expect, it } from "vitest";

import { calculateFeRequisitionSubtotal } from "@/features/fe-requisitions/form/utils/fe-requisition-calculations";
import type { FeAdditionalCostDraft } from "@/features/fe-requisitions/form/types/fe-additional-cost-draft";
import type {
    FeGeneralTaskDraft,
    WeeklyQuantitiesDraft,
} from "@/features/fe-requisitions/form/types/fe-general-task-draft";
import type { FeMileageDraft } from "@/features/fe-requisitions/form/types/fe-mileage-draft";
import type { FeRequisitionDraft } from "@/features/fe-requisitions/form/types/fe-requisition-draft";
import type { FeTransferDraft } from "@/features/fe-requisitions/form/types/fe-transfer-draft";

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

describe("calculateFeRequisitionSubtotal", () => {
    it("returns zero when the draft has no child rows", () => {
        const result = calculateFeRequisitionSubtotal(createDraft());

        expect(result).toBe(0);
    });

    it("includes general tasks, mileage, transfers, and additional costs", () => {
        const result = calculateFeRequisitionSubtotal(
            createDraft({
                feGeneralTasks: [
                    createGeneralTask({ totalValue: 10 }),
                    createGeneralTask({ totalValue: 2.5 }),
                ],
                feMileages: [
                    createMileage({ totalValue: 3 }),
                ],
                feTransfers: [
                    createTransfer({ totalValue: 4 }),
                ],
                feAdditionalCosts: [
                    createAdditionalCost({ totalValue: 5 }),
                ],
            }),
        );

        expect(result).toBe(24.5);
    });
});