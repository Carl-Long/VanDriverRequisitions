import { afterEach, describe, expect, it, vi } from "vitest";

import { createStdPickupDraftFromForm } from "@/features/std-requisitions/form/lib/create-std-pickup-draft-from-form";
import type { StdPickupForm } from "@/features/std-requisitions/form/types/std-pickup-form";

describe("createStdPickupDraftFromForm", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates a new flat-charge pickup draft row", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000001",
        );

        const form: StdPickupForm = {
            date: new Date(2026, 5, 14),
            numberOfBags: 5,
            numberOfHouseholds: 2,
            chargeType: "FlatCharge",
            miles: 99,
            ratePerMile: 99,
            flatCharge: 12,
        };

        const result = createStdPickupDraftFromForm(form);

        expect(result).toEqual({
            clientId: "00000000-0000-4000-8000-000000000001",
            id: null,
            date: form.date,
            numberOfBags: 5,
            numberOfHouseholds: 2,
            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 12,
            totalValue: 12,
        });
    });

    it("creates a new mileage pickup draft row", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000002",
        );

        const form: StdPickupForm = {
            date: new Date(2026, 5, 14),
            numberOfBags: 5,
            numberOfHouseholds: 2,
            chargeType: "Mileage",
            miles: 30,
            ratePerMile: 0.5,
            flatCharge: 99,
        };

        const result = createStdPickupDraftFromForm(form);

        expect(result).toEqual({
            clientId: "00000000-0000-4000-8000-000000000002",
            id: null,
            date: form.date,
            numberOfBags: 5,
            numberOfHouseholds: 2,
            chargeType: "Mileage",
            miles: 30,
            ratePerMile: 0.5,
            flatCharge: null,
            totalValue: 15,
        });
    });
});