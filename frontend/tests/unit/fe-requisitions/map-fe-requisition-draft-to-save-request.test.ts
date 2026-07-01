import { describe, expect, it } from "vitest";

import { mapFeRequisitionDraftToSaveRequest } from "@/features/fe-requisitions/form/lib/map-fe-requisition-draft-to-save-request";
import type { FeRequisitionDraft } from "@/features/fe-requisitions/form/types/fe-requisition-draft";

function createDraft(
    overrides: Partial<FeRequisitionDraft> = {},
): FeRequisitionDraft {
    return {
        requisitionId: "requisition-id",
        rowVersion: "row-version",
        requisitionNumber: "FE-10001",
        status: "Draft",
        requisitionDate: new Date(2026, 5, 13),

        vanDriverId: "driver-id",
        vanDriverLabel: "VD001 - Test Driver",
        vanDriverSummary: null,
        vanDriverName: "Test Driver",

        shopId: "shop-id",
        shopLabel: "001 - Test Shop",
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

describe("mapFeRequisitionDraftToSaveRequest", () => {
    it("maps root fields and child rows to the FE save request contract", () => {
        const draft = createDraft({
            feGeneralTasks: [
                {
                    id: "general-task-id",
                    clientId: "general-task-client-id",
                    taskTypeId: "task-type-id",
                    taskTypeLabel: "Collections",
                    weekEndingDate: new Date(2026, 5, 13),
                    quantities: {
                        sunday: 1,
                        monday: 2,
                        tuesday: null,
                        wednesday: 3,
                        thursday: 0,
                        friday: 4,
                        saturday: 5,
                    },
                    totalNumber: 15,
                    ratePerJob: 2,
                    totalValue: 30,
                },
            ],

            feMileages: [
                {
                    id: "mileage-id",
                    clientId: "mileage-client-id",
                    weekEndingDate: new Date(2026, 5, 14),
                    quantities: {
                        sunday: 10,
                        monday: null,
                        tuesday: 5,
                        wednesday: 0,
                        thursday: 8,
                        friday: 2,
                        saturday: 1,
                    },
                    totalMiles: 26,
                    ratePerMile: 0.5,
                    totalValue: 13,
                },
            ],

            feTransfers: [
                {
                    id: "transfer-id",
                    clientId: "transfer-client-id",

                    shopIdFrom: "from-shop-id",
                    shopLabelFrom: "001 - From Shop",
                    isShopFromActive: true,

                    shopIdTo: "to-shop-id",
                    shopLabelTo: "002 - To Shop",
                    isShopToActive: true,

                    weekEndingDate: new Date(2026, 5, 15),
                    quantities: {
                        sunday: 1,
                        monday: 1,
                        tuesday: 2,
                        wednesday: null,
                        thursday: 3,
                        friday: 0,
                        saturday: 4,
                    },
                    totalNumber: 11,
                    ratePerJob: 3,
                    totalValue: 33,
                },
            ],

            feAdditionalCosts: [
                {
                    id: "job-cost-id",
                    clientId: "job-cost-client-id",
                    weekEndingDate: new Date(2026, 5, 16),
                    reasonId: "job-reason-id",
                    reasonCode: "100",
                    reasonText: "Parking",
                    isReasonActive: true,
                    chargingOption: "Job",
                    totalNumber: 3,
                    ratePerJob: 10,
                    miles: 99,
                    ratePerMile: 99,
                    totalValue: 30,
                },
                {
                    id: "mileage-cost-id",
                    clientId: "mileage-cost-client-id",
                    weekEndingDate: new Date(2026, 5, 17),
                    reasonId: "mileage-reason-id",
                    reasonCode: "200",
                    reasonText: "Mileage",
                    isReasonActive: true,
                    chargingOption: "Mileage",
                    totalNumber: 99,
                    ratePerJob: 99,
                    miles: 20,
                    ratePerMile: 0.5,
                    totalValue: 10,
                },
            ],
        });

        const result = mapFeRequisitionDraftToSaveRequest(draft);

        expect(result).toEqual({
            rowVersion: "row-version",
            requisitionDate: "2026-06-13",
            vanDriverId: "driver-id",
            vanDriverName: "Test Driver",
            shopId: "shop-id",

            feGeneralTasks: [
                {
                    id: "general-task-id",
                    feTaskTypeId: "task-type-id",
                    weekEndingDate: "2026-06-13",
                    week: {
                        sunday: 1,
                        monday: 2,
                        tuesday: null,
                        wednesday: 3,
                        thursday: 0,
                        friday: 4,
                        saturday: 5,
                    },
                    ratePerJob: 2,
                },
            ],

            feMileages: [
                {
                    id: "mileage-id",
                    weekEndingDate: "2026-06-14",
                    week: {
                        sunday: 10,
                        monday: null,
                        tuesday: 5,
                        wednesday: 0,
                        thursday: 8,
                        friday: 2,
                        saturday: 1,
                    },
                    ratePerMile: 0.5,
                },
            ],

            feTransfers: [
                {
                    id: "transfer-id",
                    weekEndingDate: "2026-06-15",
                    shopIdFrom: "from-shop-id",
                    shopIdTo: "to-shop-id",
                    week: {
                        sunday: 1,
                        monday: 1,
                        tuesday: 2,
                        wednesday: null,
                        thursday: 3,
                        friday: 0,
                        saturday: 4,
                    },
                    ratePerJob: 3,
                },
            ],

            feAdditionalCosts: [
                {
                    id: "job-cost-id",
                    weekEndingDate: "2026-06-16",
                    reasonId: "job-reason-id",
                    chargingOption: "Job",
                    totalNumber: 3,
                    ratePerJob: 10,
                    miles: null,
                    ratePerMile: null,
                },
                {
                    id: "mileage-cost-id",
                    weekEndingDate: "2026-06-17",
                    reasonId: "mileage-reason-id",
                    chargingOption: "Mileage",
                    totalNumber: null,
                    ratePerJob: null,
                    miles: 20,
                    ratePerMile: 0.5,
                },
            ],
        });
    });

    it("throws when requisition date is missing", () => {
        const draft = createDraft({
            requisitionDate: null,
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "Requisition date is required.",
        );
    });

    it("throws when van driver is missing", () => {
        const draft = createDraft({
            vanDriverId: null,
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "Van driver is required.",
        );
    });

    it("throws when shop is missing", () => {
        const draft = createDraft({
            shopId: null,
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "Shop is required.",
        );
    });

    it("throws when a general task type is missing", () => {
        const draft = createDraft({
            feGeneralTasks: [
                {
                    id: null,
                    clientId: "client-id",
                    taskTypeId: null,
                    taskTypeLabel: null,
                    weekEndingDate: new Date(2026, 5, 13),
                    quantities: {
                        sunday: 1,
                        monday: 0,
                        tuesday: 0,
                        wednesday: 0,
                        thursday: 0,
                        friday: 0,
                        saturday: 0,
                    },
                    totalNumber: 1,
                    ratePerJob: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "General task type is required.",
        );
    });

    it("throws when a general task week ending date is missing", () => {
        const draft = createDraft({
            feGeneralTasks: [
                {
                    id: null,
                    clientId: "client-id",
                    taskTypeId: "task-type-id",
                    taskTypeLabel: "Collections",
                    weekEndingDate: null,
                    quantities: {
                        sunday: 1,
                        monday: 0,
                        tuesday: 0,
                        wednesday: 0,
                        thursday: 0,
                        friday: 0,
                        saturday: 0,
                    },
                    totalNumber: 1,
                    ratePerJob: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "General task week ending date is required.",
        );
    });

    it("throws when a mileage week ending date is missing", () => {
        const draft = createDraft({
            feMileages: [
                {
                    id: null,
                    clientId: "client-id",
                    weekEndingDate: null,
                    quantities: {
                        sunday: 1,
                        monday: 0,
                        tuesday: 0,
                        wednesday: 0,
                        thursday: 0,
                        friday: 0,
                        saturday: 0,
                    },
                    totalMiles: 1,
                    ratePerMile: 0.5,
                    totalValue: 0.5,
                },
            ],
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "Mileage week ending date is required.",
        );
    });

    it("throws when a transfer week ending date is missing", () => {
        const draft = createDraft({
            feTransfers: [
                {
                    id: null,
                    clientId: "client-id",
                    shopIdFrom: "from-shop-id",
                    shopLabelFrom: "001 - From",
                    isShopFromActive: true,
                    shopIdTo: "to-shop-id",
                    shopLabelTo: "002 - To",
                    isShopToActive: true,
                    weekEndingDate: null,
                    quantities: {
                        sunday: 1,
                        monday: 0,
                        tuesday: 0,
                        wednesday: 0,
                        thursday: 0,
                        friday: 0,
                        saturday: 0,
                    },
                    totalNumber: 1,
                    ratePerJob: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "Transfer week ending date is required.",
        );
    });

    it("throws when a transfer from shop is missing", () => {
        const draft = createDraft({
            feTransfers: [
                {
                    id: null,
                    clientId: "client-id",
                    shopIdFrom: null,
                    shopLabelFrom: null,
                    isShopFromActive: true,
                    shopIdTo: "to-shop-id",
                    shopLabelTo: "002 - To",
                    isShopToActive: true,
                    weekEndingDate: new Date(2026, 5, 13),
                    quantities: {
                        sunday: 1,
                        monday: 0,
                        tuesday: 0,
                        wednesday: 0,
                        thursday: 0,
                        friday: 0,
                        saturday: 0,
                    },
                    totalNumber: 1,
                    ratePerJob: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "Transfer from shop is required.",
        );
    });

    it("throws when a transfer to shop is missing", () => {
        const draft = createDraft({
            feTransfers: [
                {
                    id: null,
                    clientId: "client-id",
                    shopIdFrom: "from-shop-id",
                    shopLabelFrom: "001 - From",
                    isShopFromActive: true,
                    shopIdTo: null,
                    shopLabelTo: null,
                    isShopToActive: true,
                    weekEndingDate: new Date(2026, 5, 13),
                    quantities: {
                        sunday: 1,
                        monday: 0,
                        tuesday: 0,
                        wednesday: 0,
                        thursday: 0,
                        friday: 0,
                        saturday: 0,
                    },
                    totalNumber: 1,
                    ratePerJob: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "Transfer to shop is required.",
        );
    });

    it("throws when an additional cost week ending date is missing", () => {
        const draft = createDraft({
            feAdditionalCosts: [
                {
                    id: null,
                    clientId: "client-id",
                    weekEndingDate: null,
                    reasonId: "reason-id",
                    reasonCode: "100",
                    reasonText: "Parking",
                    isReasonActive: true,
                    chargingOption: "Job",
                    totalNumber: 1,
                    ratePerJob: 10,
                    miles: null,
                    ratePerMile: null,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "Additional cost week ending date is required.",
        );
    });

    it("throws when an additional cost reason is missing", () => {
        const draft = createDraft({
            feAdditionalCosts: [
                {
                    id: null,
                    clientId: "client-id",
                    weekEndingDate: new Date(2026, 5, 13),
                    reasonId: null,
                    reasonCode: null,
                    reasonText: null,
                    isReasonActive: true,
                    chargingOption: "Job",
                    totalNumber: 1,
                    ratePerJob: 10,
                    miles: null,
                    ratePerMile: null,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapFeRequisitionDraftToSaveRequest(draft)).toThrow(
            "Additional cost reason is required.",
        );
    });
});