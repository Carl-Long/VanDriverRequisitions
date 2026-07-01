import { afterEach, describe, expect, it, vi } from "vitest";

import { createStdAdditionalCostDraftFromForm } from "@/features/std-requisitions/form/lib/create-std-additional-cost-draft-from-form";
import type { StdAdditionalCostForm } from "@/features/std-requisitions/form/types/std-additional-cost-form";

describe("createStdAdditionalCostDraftFromForm", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates a new flat-charge additional cost draft row", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000010",
        );

        const form: StdAdditionalCostForm = {
            date: new Date(2026, 5, 14),

            reasonId: "reason-id",
            reasonCode: "200",
            reasonText: "Parking",
            isReasonActive: false,

            numberOfBags: 6,

            chargeType: "FlatCharge",
            miles: 99,
            ratePerMile: 99,
            flatCharge: 15,
        };

        const result = createStdAdditionalCostDraftFromForm(form);

        expect(result).toEqual({
            clientId: "00000000-0000-4000-8000-000000000010",
            id: null,

            date: form.date,

            reasonId: "reason-id",
            reasonCode: "200",
            reasonText: "Parking",
            isReasonActive: false,

            numberOfBags: 6,

            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 15,

            totalValue: 15,
        });
    });

    it("creates a new mileage additional cost draft row", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000011",
        );

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

        const result = createStdAdditionalCostDraftFromForm(form);

        expect(result).toEqual({
            clientId: "00000000-0000-4000-8000-000000000011",
            id: null,

            date: form.date,

            reasonId: "reason-id",
            reasonCode: "300",
            reasonText: "Mileage reason",
            isReasonActive: true,

            numberOfBags: 3,

            chargeType: "Mileage",
            miles: 40,
            ratePerMile: 0.5,
            flatCharge: null,

            totalValue: 20,
        });
    });
});