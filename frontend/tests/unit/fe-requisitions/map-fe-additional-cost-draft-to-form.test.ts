import { describe, expect, it } from "vitest";

import { mapFeAdditionalCostDraftToForm } from "@/features/fe-requisitions/form/lib/map-fe-additional-cost-draft-to-form";
import type { FeAdditionalCostDraft } from "@/features/fe-requisitions/form/types/fe-additional-cost-draft";

describe("mapFeAdditionalCostDraftToForm", () => {
    it("maps job additional cost draft fields to form fields and omits draft-only fields", () => {
        const row: FeAdditionalCostDraft = {
            id: "additional-cost-id",
            clientId: "additional-cost-client-id",

            weekEndingDate: new Date(2026, 5, 14),

            reasonId: "reason-id",
            reasonCode: "200",
            reasonText: "Parking",
            isReasonActive: false,

            chargingOption: "Job",

            totalNumber: 3,
            ratePerJob: 10,

            miles: null,
            ratePerMile: null,

            totalValue: 30,
        };

        const result = mapFeAdditionalCostDraftToForm(row);

        expect(result).toEqual({
            weekEndingDate: row.weekEndingDate,

            reasonId: "reason-id",
            reasonText: "Parking",
            reasonCode: "200",
            isReasonActive: false,

            chargingOption: "Job",

            totalNumber: 3,
            ratePerJob: 10,

            miles: null,
            ratePerMile: null,
        });
    });

    it("maps mileage additional cost draft fields to form fields and omits draft-only fields", () => {
        const row: FeAdditionalCostDraft = {
            id: "additional-cost-id",
            clientId: "additional-cost-client-id",

            weekEndingDate: new Date(2026, 5, 14),

            reasonId: "reason-id",
            reasonCode: "300",
            reasonText: "Mileage reason",
            isReasonActive: true,

            chargingOption: "Mileage",

            totalNumber: null,
            ratePerJob: null,

            miles: 40,
            ratePerMile: 0.5,

            totalValue: 20,
        };

        const result = mapFeAdditionalCostDraftToForm(row);

        expect(result).toEqual({
            weekEndingDate: row.weekEndingDate,

            reasonId: "reason-id",
            reasonText: "Mileage reason",
            reasonCode: "300",
            isReasonActive: true,

            chargingOption: "Mileage",

            totalNumber: null,
            ratePerJob: null,

            miles: 40,
            ratePerMile: 0.5,
        });
    });
});