import { describe, expect, it } from "vitest";

import { mapStdPickupDraftToForm } from "@/features/std-requisitions/form/lib/map-std-pickup-draft-to-form";
import type { StdPickupDraft } from "@/features/std-requisitions/form/types/std-pickup-draft";

describe("mapStdPickupDraftToForm", () => {
    it("maps pickup draft fields to form fields and omits draft-only fields", () => {
        const row: StdPickupDraft = {
            id: "pickup-id",
            clientId: "pickup-client-id",
            date: new Date(2026, 5, 14),

            numberOfBags: 5,
            numberOfHouseholds: 2,

            chargeType: "Mileage",
            miles: 30,
            ratePerMile: 0.5,
            flatCharge: null,

            totalValue: 15,
        };

        const result = mapStdPickupDraftToForm(row);

        expect(result).toEqual({
            date: row.date,

            numberOfBags: 5,
            numberOfHouseholds: 2,

            chargeType: "Mileage",

            miles: 30,
            ratePerMile: 0.5,
            flatCharge: null,
        });
    });
});