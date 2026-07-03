import { describe, expect, it } from "vitest";

import { REQUISITION_ROW_CATEGORIES } from "@/features/fe-requisitions/constants/requisition-row-categories";
import { createFeAdditionalCostFormSchema } from "@/features/fe-requisitions/form/schemas/create-fe-additional-cost-form-schema";
import { createFeGeneralTaskFormSchema } from "@/features/fe-requisitions/form/schemas/create-fe-general-task-form-schema";
import { createFeMileageFormSchema } from "@/features/fe-requisitions/form/schemas/create-fe-mileage-form-schema";
import { createFeTransferFormSchema } from "@/features/fe-requisitions/form/schemas/create-fe-transfer-form-schema";
import { feRequisitionSchema } from "@/features/fe-requisitions/form/schemas/fe-requisition-schema";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { FASCIAS } from "@/lib/constants/fascias";

type WeeklyValues = {
    sunday: number | null;
    monday: number | null;
    tuesday: number | null;
    wednesday: number | null;
    thursday: number | null;
    friday: number | null;
    saturday: number | null;
};

type ValidationIssue = {
    path: readonly PropertyKey[];
    message: string;
};

function getErrors(issues: readonly ValidationIssue[]): Record<string, string[]> {
    return issues.reduce<Record<string, string[]>>((errors, issue) => {
        const key =
            issue.path.length > 0
                ? issue.path.map(String).join(".")
                : "form";

        errors[key] ??= [];
        errors[key].push(issue.message);

        return errors;
    }, {});
}

function createQuantities(overrides: Partial<WeeklyValues> = {}): WeeklyValues {
    return {
        sunday: null,
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        ...overrides,
    };
}

function createRule(
    overrides: Partial<RequisitionLimitRuleSummary> = {},
): RequisitionLimitRuleSummary {
    return {
        id: "limit-rule-id",
        category: REQUISITION_ROW_CATEGORIES.GENERAL_TASK,
        categoryName: "General Task",
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

function createGeneralTaskForm(overrides: Record<string, unknown> = {}) {
    return {
        weekEndingDate: new Date(2026, 5, 14),
        quantities: createQuantities({ sunday: 1 }),
        ratePerJob: 1,
        ...overrides,
    };
}

function createMileageForm(overrides: Record<string, unknown> = {}) {
    return {
        weekEndingDate: new Date(2026, 5, 14),
        quantities: createQuantities({ sunday: 1 }),
        ratePerMile: 0.45,
        ...overrides,
    };
}

function createTransferForm(overrides: Record<string, unknown> = {}) {
    return {
        shopIdFrom: "from-shop-id",
        shopLabelFrom: "001 - From Shop",
        isShopFromActive: true,

        shopIdTo: "to-shop-id",
        shopLabelTo: "002 - To Shop",
        isShopToActive: true,

        weekEndingDate: new Date(2026, 5, 14),
        quantities: createQuantities({ sunday: 1 }),
        ratePerJob: 1,

        ...overrides,
    };
}

function createAdditionalCostForm(overrides: Record<string, unknown> = {}) {
    return {
        weekEndingDate: new Date(2026, 5, 14),

        reasonId: "reason-id",
        reasonCode: "27302",
        reasonText: "Additional cost",
        isReasonActive: true,

        chargingOption: "Job",

        totalNumber: 1,
        ratePerJob: 1,

        miles: null,
        ratePerMile: null,

        ...overrides,
    };
}

describe("feRequisitionSchema", () => {
    it("rejects missing required header fields", () => {
        const result = feRequisitionSchema.safeParse({
            requisitionDate: null,
            vanDriverId: null,
            vanDriverName: "",
            shopId: null,
            feGeneralTasks: [],
            feMileages: [],
            feTransfers: [],
            feAdditionalCosts: [],
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                requisitionDate: ["Requisition date is required"],
                vanDriverId: ["81 code is required"],
                vanDriverName: ["Van driver name is required"],
                shopId: ["Shop is required"],
            });
        }
    });

    it("rejects a valid header with no requisition rows", () => {
        const result = feRequisitionSchema.safeParse({
            requisitionDate: new Date(2026, 5, 14),
            vanDriverId: "van-driver-id",
            vanDriverName: "Van Driver",
            shopId: "shop-id",
            feGeneralTasks: [],
            feMileages: [],
            feTransfers: [],
            feAdditionalCosts: [],
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                form: ["At least one requisition row is required"],
            });
        }
    });

    it("accepts valid header fields when at least one child row exists", () => {
        const result = feRequisitionSchema.safeParse({
            requisitionDate: new Date(2026, 5, 14),
            vanDriverId: "van-driver-id",
            vanDriverName: "Van Driver",
            shopId: "shop-id",
            feGeneralTasks: [{}],
            feMileages: [],
            feTransfers: [],
            feAdditionalCosts: [],
        });

        expect(result.success).toBe(true);
    });
});

describe("createFeGeneralTaskFormSchema", () => {
    it("accepts a valid general task form when a matching limit rule exists", () => {
        const schema = createFeGeneralTaskFormSchema(
            createRule({
                maxQuantity: 10,
                maxRate: 2,
            }),
        );

        const result = schema.safeParse(
            createGeneralTaskForm({
                quantities: createQuantities({ sunday: 10 }),
                ratePerJob: 2,
            }),
        );

        expect(result.success).toBe(true);
    });

    it("rejects missing quantity, missing rate, and missing limit rule", () => {
        const result = createFeGeneralTaskFormSchema().safeParse(
            createGeneralTaskForm({
                quantities: createQuantities(),
                ratePerJob: null,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                form: [
                    "At least one job quantity is required",
                    "No limit rule is configured for this item. Please contact an administrator.",
                ],
                ratePerJob: ["Rate per job is required"],
            });
        }
    });

    it("rejects over-limit quantities and rates with formatted currency", () => {
        const schema = createFeGeneralTaskFormSchema(
            createRule({
                maxQuantity: 5,
                maxRate: 0.3,
            }),
        );

        const result = schema.safeParse(
            createGeneralTaskForm({
                quantities: createQuantities({ sunday: 6 }),
                ratePerJob: 0.31,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                "quantities.sunday": ["exceeds max quantity (5)"],
                ratePerJob: ["Maximum rate of £0.30 exceeded"],
            });
        }
    });

    it("rejects rates with more than two decimal places", () => {
        const schema = createFeGeneralTaskFormSchema(createRule());

        const result = schema.safeParse(
            createGeneralTaskForm({
                ratePerJob: 1.234,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                ratePerJob: ["Rate per job can have a maximum of 2 decimal places"],
            });
        }
    });
});

describe("createFeMileageFormSchema", () => {
    it("accepts a valid mileage form when a matching limit rule exists", () => {
        const schema = createFeMileageFormSchema(
            createRule({
                category: REQUISITION_ROW_CATEGORIES.MILEAGE,
                categoryName: "Mileage",
                maxQuantity: 20,
                maxRate: 0.45,
            }),
        );

        const result = schema.safeParse(
            createMileageForm({
                quantities: createQuantities({ sunday: 20 }),
                ratePerMile: 0.45,
            }),
        );

        expect(result.success).toBe(true);
    });

    it("rejects missing mileage quantity, missing rate, and missing limit rule", () => {
        const result = createFeMileageFormSchema().safeParse(
            createMileageForm({
                quantities: createQuantities(),
                ratePerMile: null,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                form: [
                    "At least one mileage quantity is required",
                    "No mileage limit rule is configured. Please contact an administrator.",
                ],
                ratePerMile: ["Rate per mile is required"],
            });
        }
    });
});

describe("createFeTransferFormSchema", () => {
    it("accepts a valid transfer form when a matching limit rule exists", () => {
        const schema = createFeTransferFormSchema(
            createRule({
                category: REQUISITION_ROW_CATEGORIES.TRANSFER,
                categoryName: "Transfer",
                maxQuantity: 10,
                maxRate: 2,
            }),
        );

        const result = schema.safeParse(createTransferForm());

        expect(result.success).toBe(true);
    });

    it("rejects missing shops and same-shop transfers", () => {
        const schema = createFeTransferFormSchema(createRule());

        const missingShopResult = schema.safeParse(
            createTransferForm({
                shopIdFrom: null,
                shopIdTo: null,
            }),
        );

        expect(missingShopResult.success).toBe(false);

        if (!missingShopResult.success) {
            expect(getErrors(missingShopResult.error.issues)).toMatchObject({
                shopIdFrom: ["From shop is required"],
                shopIdTo: ["To shop is required"],
            });
        }

        const sameShopResult = schema.safeParse(
            createTransferForm({
                shopIdFrom: "same-shop-id",
                shopIdTo: "same-shop-id",
            }),
        );

        expect(sameShopResult.success).toBe(false);

        if (!sameShopResult.success) {
            expect(getErrors(sameShopResult.error.issues)).toMatchObject({
                shopIdTo: ["From shop and to shop must be different"],
            });
        }
    });
});

describe("createFeAdditionalCostFormSchema", () => {
    it("accepts a valid job-based additional cost form", () => {
        const schema = createFeAdditionalCostFormSchema({
            additionalCostLimitRule: createRule({
                category: REQUISITION_ROW_CATEGORIES.ADDITIONAL_COST,
                categoryName: "Additional Cost",
                maxQuantity: 5,
                maxRate: 10,
            }),
            mileageLimitRule: createRule({
                category: REQUISITION_ROW_CATEGORIES.MILEAGE,
                categoryName: "Mileage",
                maxQuantity: 20,
                maxRate: 0.45,
            }),
        });

        const result = schema.safeParse(
            createAdditionalCostForm({
                chargingOption: "Job",
                totalNumber: 5,
                ratePerJob: 10,
                miles: null,
                ratePerMile: null,
            }),
        );

        expect(result.success).toBe(true);
    });

    it("accepts a valid mileage-based additional cost form", () => {
        const schema = createFeAdditionalCostFormSchema({
            additionalCostLimitRule: createRule({
                category: REQUISITION_ROW_CATEGORIES.ADDITIONAL_COST,
                categoryName: "Additional Cost",
                maxQuantity: 5,
                maxRate: 10,
            }),
            mileageLimitRule: createRule({
                category: REQUISITION_ROW_CATEGORIES.MILEAGE,
                categoryName: "Mileage",
                maxQuantity: 20,
                maxRate: 0.45,
            }),
        });

        const result = schema.safeParse(
            createAdditionalCostForm({
                chargingOption: "Mileage",
                totalNumber: null,
                ratePerJob: null,
                miles: 20,
                ratePerMile: 0.45,
            }),
        );

        expect(result.success).toBe(true);
    });

    it("rejects job rows with missing job fields, mileage fields, and missing additional-cost limit rule", () => {
        const result = createFeAdditionalCostFormSchema({
            mileageLimitRule: createRule({
                category: REQUISITION_ROW_CATEGORIES.MILEAGE,
                categoryName: "Mileage",
            }),
        }).safeParse(
            createAdditionalCostForm({
                chargingOption: "Job",
                totalNumber: null,
                ratePerJob: null,
                miles: 1,
                ratePerMile: 0.45,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                totalNumber: ["Total number is required"],
                ratePerJob: ["Rate per job is required"],
                form: [
                    "Mileage fields must be empty for job-based additional costs",
                    "No additional cost limit rule is configured. Please contact an administrator.",
                ],
            });
        }
    });

    it("rejects mileage rows with missing mileage fields, job fields, and missing mileage limit rule", () => {
        const result = createFeAdditionalCostFormSchema({
            additionalCostLimitRule: createRule({
                category: REQUISITION_ROW_CATEGORIES.ADDITIONAL_COST,
                categoryName: "Additional Cost",
            }),
        }).safeParse(
            createAdditionalCostForm({
                chargingOption: "Mileage",
                totalNumber: 1,
                ratePerJob: 10,
                miles: null,
                ratePerMile: null,
            }),
        );

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(getErrors(result.error.issues)).toMatchObject({
                miles: ["Miles are required"],
                ratePerMile: ["Rate per mile is required"],
                form: [
                    "Job fields must be empty for mileage-based additional costs",
                    "No mileage limit rule is configured. Please contact an administrator.",
                ],
            });
        }
    });

    it("rejects over-limit job and mileage rows", () => {
        const schema = createFeAdditionalCostFormSchema({
            additionalCostLimitRule: createRule({
                category: REQUISITION_ROW_CATEGORIES.ADDITIONAL_COST,
                categoryName: "Additional Cost",
                maxQuantity: 3,
                maxRate: 10,
            }),
            mileageLimitRule: createRule({
                category: REQUISITION_ROW_CATEGORIES.MILEAGE,
                categoryName: "Mileage",
                maxQuantity: 20,
                maxRate: 0.45,
            }),
        });

        const jobResult = schema.safeParse(
            createAdditionalCostForm({
                chargingOption: "Job",
                totalNumber: 4,
                ratePerJob: 10.01,
            }),
        );

        expect(jobResult.success).toBe(false);

        if (!jobResult.success) {
            expect(getErrors(jobResult.error.issues)).toMatchObject({
                totalNumber: ["Maximum quantity of 3 exceeded"],
                ratePerJob: ["Maximum rate of £10.00 exceeded"],
            });
        }

        const mileageResult = schema.safeParse(
            createAdditionalCostForm({
                chargingOption: "Mileage",
                totalNumber: null,
                ratePerJob: null,
                miles: 21,
                ratePerMile: 0.46,
            }),
        );

        expect(mileageResult.success).toBe(false);

        if (!mileageResult.success) {
            expect(getErrors(mileageResult.error.issues)).toMatchObject({
                miles: ["Maximum mileage of 20 exceeded"],
                ratePerMile: ["Maximum rate of £0.45 exceeded"],
            });
        }
    });
});