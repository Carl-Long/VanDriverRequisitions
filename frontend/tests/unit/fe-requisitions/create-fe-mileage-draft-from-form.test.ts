import { afterEach, describe, expect, it, vi } from "vitest";

import { createFeMileageDraftFromForm } from "@/features/fe-requisitions/form/lib/create-fe-mileage-draft-from-form";
import type { FeMileageForm } from "@/features/fe-requisitions/form/types/fe-mileage-form";

describe("createFeMileageDraftFromForm", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates a new mileage draft row with calculated totals", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000103",
        );

        const form: FeMileageForm = {
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
            ratePerMile: 0.5,
        };

        const result = createFeMileageDraftFromForm({ form });

        expect(result).toEqual({
            id: null,
            clientId: "00000000-0000-4000-8000-000000000103",

            weekEndingDate: form.weekEndingDate,

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
        });
    });

    it("treats null quantities and null rate as zero for totals", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000104",
        );

        const form: FeMileageForm = {
            weekEndingDate: new Date(2026, 5, 14),
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

        const result = createFeMileageDraftFromForm({ form });

        expect(result.clientId).toBe("00000000-0000-4000-8000-000000000104");
        expect(result.id).toBeNull();
        expect(result.totalMiles).toBe(0);
        expect(result.totalValue).toBe(0);
    });
});