import { describe, expect, it } from "vitest";

import { mapStdAdditionalCostDraftToForm } from "@/features/std-requisitions/form/lib/map-std-additional-cost-draft-to-form";
import type { StdAdditionalCostDraft } from "@/features/std-requisitions/form/types/std-additional-cost-draft";

describe("mapStdAdditionalCostDraftToForm", () => {
    it("maps additional cost draft fields to form fields and omits draft-only fields", () => {
        const row: StdAdditionalCostDraft = {
            id: "additional-cost-id",
            clientId: "additional-cost-client-id",
            date: new Date(2026, 5, 14),

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
        };

        const result = mapStdAdditionalCostDraftToForm(row);

        expect(result).toEqual({
            date: row.date,

            reasonId: "reason-id",
            reasonCode: "200",
            reasonText: "Parking",
            isReasonActive: false,

            numberOfBags: 6,

            chargeType: "FlatCharge",

            miles: null,
            ratePerMile: null,
            flatCharge: 15,
        });
    });
});