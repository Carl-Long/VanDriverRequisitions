import { describe, expect, it } from "vitest";

import { mapFeMileageDraftToForm } from "@/features/fe-requisitions/form/lib/map-fe-mileage-draft-to-form";
import type { FeMileageDraft } from "@/features/fe-requisitions/form/types/fe-mileage-draft";

describe("mapFeMileageDraftToForm", () => {
    it("maps mileage draft fields to form fields and omits draft-only fields", () => {
        const row: FeMileageDraft = {
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
        };

        const result = mapFeMileageDraftToForm(row);

        expect(result).toEqual({
            weekEndingDate: row.weekEndingDate,

            quantities: {
                sunday: 10,
                monday: null,
                tuesday: 5,
                wednesday: 0,
                thursday: 8,
                friday: 2,
                saturday: 1,
            },

            ratePerMile: 0.5,
        });
    });

    it("copies quantities rather than reusing the same object reference", () => {
        const row: FeMileageDraft = {
            id: "mileage-id",
            clientId: "mileage-client-id",

            weekEndingDate: new Date(2026, 5, 14),

            quantities: {
                sunday: 1,
                monday: 2,
                tuesday: 3,
                wednesday: 4,
                thursday: 5,
                friday: 6,
                saturday: 7,
            },

            totalMiles: 28,
            ratePerMile: 0.5,
            totalValue: 14,
        };

        const result = mapFeMileageDraftToForm(row);

        expect(result.quantities).toEqual(row.quantities);
        expect(result.quantities).not.toBe(row.quantities);
    });
});