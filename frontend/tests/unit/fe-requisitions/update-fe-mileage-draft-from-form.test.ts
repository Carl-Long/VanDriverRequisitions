import { describe, expect, it } from "vitest";

import { updateFeMileageDraftFromForm } from "@/features/fe-requisitions/form/lib/update-fe-mileage-draft-from-form";
import type { FeMileageDraft } from "@/features/fe-requisitions/form/types/fe-mileage-draft";
import type { FeMileageForm } from "@/features/fe-requisitions/form/types/fe-mileage-form";

describe("updateFeMileageDraftFromForm", () => {
    it("preserves row identity while updating form fields and recalculating mileage totals", () => {
        const existing: FeMileageDraft = {
            id: "mileage-id",
            clientId: "mileage-client-id",
            weekEndingDate: new Date(2026, 5, 6),
            quantities: {
                sunday: 0,
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
            },
            totalMiles: 0,
            ratePerMile: 1,
            totalValue: 0,
        };

        const form: FeMileageForm = {
            weekEndingDate: new Date(2026, 5, 13),
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
        };

        const result = updateFeMileageDraftFromForm(existing, form);

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);

        expect(result.weekEndingDate).toBe(form.weekEndingDate);
        expect(result.quantities).toEqual(form.quantities);
        expect(result.ratePerMile).toBe(0.5);

        expect(result.totalMiles).toBe(26);
        expect(result.totalValue).toBe(13);
    });

    it("treats null quantities and null rate as zero for totals", () => {
        const existing: FeMileageDraft = {
            id: null,
            clientId: "client-id",
            weekEndingDate: null,
            quantities: {
                sunday: 1,
                monday: 1,
                tuesday: 1,
                wednesday: 1,
                thursday: 1,
                friday: 1,
                saturday: 1,
            },
            totalMiles: 7,
            ratePerMile: 1,
            totalValue: 7,
        };

        const form: FeMileageForm = {
            weekEndingDate: new Date(2026, 5, 13),
            quantities: {
                sunday: null,
                monday: null,
                tuesday: null,
                wednesday: null,
                thursday: null,
                friday: null,
                saturday: null,
            },
            ratePerMile: null,
        };

        const result = updateFeMileageDraftFromForm(existing, form);

        expect(result.totalMiles).toBe(0);
        expect(result.totalValue).toBe(0);
    });
});