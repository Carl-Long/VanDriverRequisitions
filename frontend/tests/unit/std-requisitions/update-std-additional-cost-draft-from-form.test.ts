import { describe, expect, it } from "vitest";

import { updateStdAdditionalCostDraftFromForm } from "@/features/std-requisitions/form/lib/update-std-additional-cost-draft-from-form";
import type { StdAdditionalCostDraft } from "@/features/std-requisitions/form/types/std-additional-cost-draft";
import type { StdAdditionalCostForm } from "@/features/std-requisitions/form/types/std-additional-cost-form";

describe("updateStdAdditionalCostDraftFromForm", () => {
    it("preserves row identity, updates reason fields, normalises flat charge fields, and recalculates total value", () => {
        const existing: StdAdditionalCostDraft = {
            id: "additional-cost-id",
            clientId: "additional-cost-client-id",
            date: new Date(2026, 5, 13),

            reasonId: "old-reason-id",
            reasonCode: "100",
            reasonText: "Old Reason",
            isReasonActive: true,

            numberOfBags: 1,

            chargeType: "Mileage",
            miles: 20,
            ratePerMile: 0.5,
            flatCharge: null,

            totalValue: 10,
        };

        const form: StdAdditionalCostForm = {
            date: new Date(2026, 5, 14),

            reasonId: "new-reason-id",
            reasonCode: "200",
            reasonText: "Parking",
            isReasonActive: false,

            numberOfBags: 6,

            chargeType: "FlatCharge",
            miles: 99,
            ratePerMile: 99,
            flatCharge: 15,
        };

        const result = updateStdAdditionalCostDraftFromForm(existing, form);

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);

        expect(result.date).toBe(form.date);

        expect(result.reasonId).toBe("new-reason-id");
        expect(result.reasonCode).toBe("200");
        expect(result.reasonText).toBe("Parking");
        expect(result.isReasonActive).toBe(false);

        expect(result.numberOfBags).toBe(6);

        expect(result.chargeType).toBe("FlatCharge");
        expect(result.miles).toBeNull();
        expect(result.ratePerMile).toBeNull();
        expect(result.flatCharge).toBe(15);

        expect(result.totalValue).toBe(15);
    });

    it("normalises mileage fields and recalculates total value", () => {
        const existing: StdAdditionalCostDraft = {
            id: "additional-cost-id",
            clientId: "additional-cost-client-id",
            date: null,

            reasonId: null,
            reasonCode: null,
            reasonText: null,
            isReasonActive: true,

            numberOfBags: null,

            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 25,

            totalValue: 25,
        };

        const form: StdAdditionalCostForm = {
            date: new Date(2026, 5, 14),

            reasonId: "reason-id",
            reasonCode: "300",
            reasonText: "Mileage reason",
            isReasonActive: true,

            numberOfBags: 3,

            chargeType: "Mileage",
            miles: 40,
            ratePerMile: 0.5,
            flatCharge: 99,
        };

        const result = updateStdAdditionalCostDraftFromForm(existing, form);

        expect(result.reasonId).toBe("reason-id");
        expect(result.reasonCode).toBe("300");
        expect(result.reasonText).toBe("Mileage reason");
        expect(result.isReasonActive).toBe(true);

        expect(result.numberOfBags).toBe(3);

        expect(result.chargeType).toBe("Mileage");
        expect(result.miles).toBe(40);
        expect(result.ratePerMile).toBe(0.5);
        expect(result.flatCharge).toBeNull();

        expect(result.totalValue).toBe(20);
    });

    it("treats missing charge values as zero for total value", () => {
        const existing: StdAdditionalCostDraft = {
            id: null,
            clientId: "additional-cost-client-id",
            date: null,

            reasonId: null,
            reasonCode: null,
            reasonText: null,
            isReasonActive: true,

            numberOfBags: null,

            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 25,

            totalValue: 25,
        };

        const form: StdAdditionalCostForm = {
            date: new Date(2026, 5, 14),

            reasonId: "reason-id",
            reasonCode: "300",
            reasonText: "Mileage reason",
            isReasonActive: true,

            numberOfBags: null,

            chargeType: "Mileage",
            miles: null,
            ratePerMile: null,
            flatCharge: 99,
        };

        const result = updateStdAdditionalCostDraftFromForm(existing, form);

        expect(result.chargeType).toBe("Mileage");
        expect(result.miles).toBeNull();
        expect(result.ratePerMile).toBeNull();
        expect(result.flatCharge).toBeNull();
        expect(result.totalValue).toBe(0);
    });
});