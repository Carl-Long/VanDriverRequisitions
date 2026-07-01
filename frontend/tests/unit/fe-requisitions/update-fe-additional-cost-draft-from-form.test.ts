import { describe, expect, it } from "vitest";

import { updateFeAdditionalCostDraftFromForm } from "@/features/fe-requisitions/form/lib/update-fe-additional-cost-draft-from-form";
import type { FeAdditionalCostDraft } from "@/features/fe-requisitions/form/types/fe-additional-cost-draft";
import type { FeAdditionalCostForm } from "@/features/fe-requisitions/form/types/fe-additional-cost-form";

describe("updateFeAdditionalCostDraftFromForm", () => {
    it("preserves row identity, normalises job fields, and recalculates total value", () => {
        const existing: FeAdditionalCostDraft = {
            id: "additional-cost-id",
            clientId: "additional-cost-client-id",

            weekEndingDate: new Date(2026, 5, 6),

            reasonId: "old-reason-id",
            reasonCode: "100",
            reasonText: "Old reason",
            isReasonActive: true,

            chargingOption: "Mileage",

            totalNumber: null,
            ratePerJob: null,

            miles: 20,
            ratePerMile: 0.5,

            totalValue: 10,
        };

        const form: FeAdditionalCostForm = {
            weekEndingDate: new Date(2026, 5, 13),

            reasonId: "new-reason-id",
            reasonCode: "200",
            reasonText: "Parking",
            isReasonActive: false,

            chargingOption: "Job",

            totalNumber: 3,
            ratePerJob: 10,

            miles: 99,
            ratePerMile: 99,
        };

        const result = updateFeAdditionalCostDraftFromForm(existing, form);

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);

        expect(result.weekEndingDate).toBe(form.weekEndingDate);

        expect(result.reasonId).toBe("new-reason-id");
        expect(result.reasonCode).toBe("200");
        expect(result.reasonText).toBe("Parking");
        expect(result.isReasonActive).toBe(false);

        expect(result.chargingOption).toBe("Job");

        expect(result.totalNumber).toBe(3);
        expect(result.ratePerJob).toBe(10);

        expect(result.miles).toBeNull();
        expect(result.ratePerMile).toBeNull();

        expect(result.totalValue).toBe(30);
    });

    it("preserves row identity, normalises mileage fields, and recalculates total value", () => {
        const existing: FeAdditionalCostDraft = {
            id: "additional-cost-id",
            clientId: "additional-cost-client-id",

            weekEndingDate: new Date(2026, 5, 6),

            reasonId: "old-reason-id",
            reasonCode: "100",
            reasonText: "Old reason",
            isReasonActive: true,

            chargingOption: "Job",

            totalNumber: 4,
            ratePerJob: 10,

            miles: null,
            ratePerMile: null,

            totalValue: 40,
        };

        const form: FeAdditionalCostForm = {
            weekEndingDate: new Date(2026, 5, 13),

            reasonId: "new-reason-id",
            reasonCode: "200",
            reasonText: "Mileage reason",
            isReasonActive: true,

            chargingOption: "Mileage",

            totalNumber: 99,
            ratePerJob: 99,

            miles: 20,
            ratePerMile: 0.5,
        };

        const result = updateFeAdditionalCostDraftFromForm(existing, form);

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);

        expect(result.reasonId).toBe("new-reason-id");
        expect(result.reasonCode).toBe("200");
        expect(result.reasonText).toBe("Mileage reason");
        expect(result.isReasonActive).toBe(true);

        expect(result.chargingOption).toBe("Mileage");

        expect(result.totalNumber).toBeNull();
        expect(result.ratePerJob).toBeNull();

        expect(result.miles).toBe(20);
        expect(result.ratePerMile).toBe(0.5);

        expect(result.totalValue).toBe(10);
    });

    it("treats null job values as zero for total value", () => {
        const existing: FeAdditionalCostDraft = {
            id: null,
            clientId: "client-id",
            weekEndingDate: null,
            reasonId: null,
            reasonCode: null,
            reasonText: null,
            isReasonActive: true,
            chargingOption: "Mileage",
            totalNumber: null,
            ratePerJob: null,
            miles: 10,
            ratePerMile: 1,
            totalValue: 10,
        };

        const form: FeAdditionalCostForm = {
            weekEndingDate: new Date(2026, 5, 13),
            reasonId: "reason-id",
            reasonCode: "200",
            reasonText: "Reason",
            isReasonActive: true,
            chargingOption: "Job",
            totalNumber: null,
            ratePerJob: null,
            miles: 99,
            ratePerMile: 99,
        };

        const result = updateFeAdditionalCostDraftFromForm(existing, form);

        expect(result.totalNumber).toBeNull();
        expect(result.ratePerJob).toBeNull();
        expect(result.miles).toBeNull();
        expect(result.ratePerMile).toBeNull();
        expect(result.totalValue).toBe(0);
    });

    it("treats null mileage values as zero for total value", () => {
        const existing: FeAdditionalCostDraft = {
            id: null,
            clientId: "client-id",
            weekEndingDate: null,
            reasonId: null,
            reasonCode: null,
            reasonText: null,
            isReasonActive: true,
            chargingOption: "Job",
            totalNumber: 10,
            ratePerJob: 1,
            miles: null,
            ratePerMile: null,
            totalValue: 10,
        };

        const form: FeAdditionalCostForm = {
            weekEndingDate: new Date(2026, 5, 13),
            reasonId: "reason-id",
            reasonCode: "200",
            reasonText: "Reason",
            isReasonActive: true,
            chargingOption: "Mileage",
            totalNumber: 99,
            ratePerJob: 99,
            miles: null,
            ratePerMile: null,
        };

        const result = updateFeAdditionalCostDraftFromForm(existing, form);

        expect(result.totalNumber).toBeNull();
        expect(result.ratePerJob).toBeNull();
        expect(result.miles).toBeNull();
        expect(result.ratePerMile).toBeNull();
        expect(result.totalValue).toBe(0);
    });
});