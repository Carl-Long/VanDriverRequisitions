import { describe, expect, it } from "vitest";

import { calculateFeAdditionalCostTotals } from "@/features/fe-requisitions/form/lib/calculate-fe-additional-cost-totals";
import { calculateFeGeneralTaskTotals } from "@/features/fe-requisitions/form/lib/calculate-fe-general-task-totals";
import { calculateFeMileageTotals } from "@/features/fe-requisitions/form/lib/calculate-fe-mileage-totals";
import { calculateFeTransferTotals } from "@/features/fe-requisitions/form/lib/calculate-fe-transfer-totals";
import type { FeAdditionalCostDraft } from "@/features/fe-requisitions/form/types/fe-additional-cost-draft";
import type { FeGeneralTaskDraft, WeeklyQuantitiesDraft } from "@/features/fe-requisitions/form/types/fe-general-task-draft";
import type { FeMileageDraft } from "@/features/fe-requisitions/form/types/fe-mileage-draft";
import type { FeTransferDraft } from "@/features/fe-requisitions/form/types/fe-transfer-draft";

function createWeeklyQuantities(
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
        quantities: createWeeklyQuantities(),
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
        quantities: createWeeklyQuantities(),
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
        quantities: createWeeklyQuantities(),

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

describe("FE row total helpers", () => {
    it("aggregates general task weekday totals, job totals, and subtotal", () => {
        const result = calculateFeGeneralTaskTotals([
            createGeneralTask({
                quantities: createWeeklyQuantities({
                    sunday: 1,
                    monday: null,
                    tuesday: 2,
                    wednesday: 0,
                    thursday: 3,
                    friday: 4,
                    saturday: 5,
                }),
                totalNumber: 15,
                totalValue: 30,
            }),
            createGeneralTask({
                quantities: createWeeklyQuantities({
                    sunday: 2,
                    monday: 3,
                    tuesday: null,
                    wednesday: 1,
                    thursday: 0,
                    friday: 0,
                    saturday: null,
                }),
                totalNumber: 6,
                totalValue: 12.5,
            }),
        ]);

        expect(result).toEqual({
            sunday: 3,
            monday: 3,
            tuesday: 2,
            wednesday: 1,
            thursday: 3,
            friday: 4,
            saturday: 5,
            totalJobs: 21,
            subtotal: 42.5,
        });
    });

    it("aggregates mileage weekday totals, mileage totals, and subtotal", () => {
        const result = calculateFeMileageTotals([
            createMileage({
                quantities: createWeeklyQuantities({
                    sunday: 1,
                    monday: null,
                    tuesday: 2,
                    wednesday: 0,
                    thursday: 3,
                    friday: 4,
                    saturday: 5,
                }),
                totalMiles: 15,
                totalValue: 6.75,
            }),
            createMileage({
                quantities: createWeeklyQuantities({
                    sunday: 2,
                    monday: 3,
                    tuesday: null,
                    wednesday: 1,
                    thursday: 0,
                    friday: 0,
                    saturday: null,
                }),
                totalMiles: 6,
                totalValue: 2.7,
            }),
        ]);

        expect(result).toEqual({
            sunday: 3,
            monday: 3,
            tuesday: 2,
            wednesday: 1,
            thursday: 3,
            friday: 4,
            saturday: 5,
            totalMiles: 21,
            subtotal: 9.45,
        });
    });

    it("aggregates transfer weekday totals, transfer totals, and subtotal", () => {
        const result = calculateFeTransferTotals([
            createTransfer({
                quantities: createWeeklyQuantities({
                    sunday: 1,
                    monday: null,
                    tuesday: 2,
                    wednesday: 0,
                    thursday: 3,
                    friday: 4,
                    saturday: 5,
                }),
                totalNumber: 15,
                totalValue: 30,
            }),
            createTransfer({
                quantities: createWeeklyQuantities({
                    sunday: 2,
                    monday: 3,
                    tuesday: null,
                    wednesday: 1,
                    thursday: 0,
                    friday: 0,
                    saturday: null,
                }),
                totalNumber: 6,
                totalValue: 12.5,
            }),
        ]);

        expect(result).toEqual({
            sunday: 3,
            monday: 3,
            tuesday: 2,
            wednesday: 1,
            thursday: 3,
            friday: 4,
            saturday: 5,
            totalNumber: 21,
            subtotal: 42.5,
        });
    });

    it("aggregates additional cost job quantity, mileage quantity, and subtotal by charging option", () => {
        const result = calculateFeAdditionalCostTotals([
            createAdditionalCost({
                chargingOption: "Job",
                totalNumber: 2,
                miles: 99,
                totalValue: 20,
            }),
            createAdditionalCost({
                chargingOption: "Mileage",
                totalNumber: 99,
                miles: 12,
                totalValue: 5.4,
            }),
            createAdditionalCost({
                chargingOption: "Job",
                totalNumber: null,
                miles: null,
                totalValue: 10,
            }),
        ]);

        expect(result).toEqual({
            totalJobQuantity: 2,
            totalMiles: 12,
            subtotal: 35.4,
        });
    });

    it("returns zero totals for empty row collections", () => {
        expect(calculateFeGeneralTaskTotals([])).toEqual({
            sunday: 0,
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            totalJobs: 0,
            subtotal: 0,
        });

        expect(calculateFeMileageTotals([])).toEqual({
            sunday: 0,
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            totalMiles: 0,
            subtotal: 0,
        });

        expect(calculateFeTransferTotals([])).toEqual({
            sunday: 0,
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            totalNumber: 0,
            subtotal: 0,
        });

        expect(calculateFeAdditionalCostTotals([])).toEqual({
            totalJobQuantity: 0,
            totalMiles: 0,
            subtotal: 0,
        });
    });
});