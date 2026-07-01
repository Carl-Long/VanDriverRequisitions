import { describe, expect, it } from "vitest";

import { updateStdPickupDraftFromForm } from "@/features/std-requisitions/form/lib/update-std-pickup-draft-from-form";
import type { StdPickupDraft } from "@/features/std-requisitions/form/types/std-pickup-draft";
import type { StdPickupForm } from "@/features/std-requisitions/form/types/std-pickup-form";

describe("updateStdPickupDraftFromForm", () => {
    it("preserves row identity, normalises flat charge fields, and recalculates total value", () => {
        const existing: StdPickupDraft = {
            id: "pickup-id",
            clientId: "pickup-client-id",
            date: new Date(2026, 5, 13),
            numberOfBags: 1,
            numberOfHouseholds: 1,
            chargeType: "Mileage",
            miles: 20,
            ratePerMile: 0.5,
            flatCharge: null,
            totalValue: 10,
        };

        const form: StdPickupForm = {
            date: new Date(2026, 5, 14),
            numberOfBags: 5,
            numberOfHouseholds: 2,
            chargeType: "FlatCharge",
            miles: 99,
            ratePerMile: 99,
            flatCharge: 12,
        };

        const result = updateStdPickupDraftFromForm(existing, form);

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);

        expect(result.date).toBe(form.date);
        expect(result.numberOfBags).toBe(5);
        expect(result.numberOfHouseholds).toBe(2);

        expect(result.chargeType).toBe("FlatCharge");
        expect(result.miles).toBeNull();
        expect(result.ratePerMile).toBeNull();
        expect(result.flatCharge).toBe(12);

        expect(result.totalValue).toBe(12);
    });

    it("preserves row identity, normalises mileage fields, and recalculates total value", () => {
        const existing: StdPickupDraft = {
            id: "pickup-id",
            clientId: "pickup-client-id",
            date: new Date(2026, 5, 13),
            numberOfBags: 1,
            numberOfHouseholds: 1,
            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 20,
            totalValue: 20,
        };

        const form: StdPickupForm = {
            date: new Date(2026, 5, 14),
            numberOfBags: 5,
            numberOfHouseholds: 2,
            chargeType: "Mileage",
            miles: 30,
            ratePerMile: 0.5,
            flatCharge: 99,
        };

        const result = updateStdPickupDraftFromForm(existing, form);

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);

        expect(result.date).toBe(form.date);
        expect(result.numberOfBags).toBe(5);
        expect(result.numberOfHouseholds).toBe(2);

        expect(result.chargeType).toBe("Mileage");
        expect(result.miles).toBe(30);
        expect(result.ratePerMile).toBe(0.5);
        expect(result.flatCharge).toBeNull();

        expect(result.totalValue).toBe(15);
    });

    it("treats missing charge values as zero for total value", () => {
        const existing: StdPickupDraft = {
            id: null,
            clientId: "pickup-client-id",
            date: null,
            numberOfBags: null,
            numberOfHouseholds: null,
            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 10,
            totalValue: 10,
        };

        const form: StdPickupForm = {
            date: new Date(2026, 5, 14),
            numberOfBags: null,
            numberOfHouseholds: null,
            chargeType: "Mileage",
            miles: null,
            ratePerMile: null,
            flatCharge: 99,
        };

        const result = updateStdPickupDraftFromForm(existing, form);

        expect(result.chargeType).toBe("Mileage");
        expect(result.miles).toBeNull();
        expect(result.ratePerMile).toBeNull();
        expect(result.flatCharge).toBeNull();
        expect(result.totalValue).toBe(0);
    });
});