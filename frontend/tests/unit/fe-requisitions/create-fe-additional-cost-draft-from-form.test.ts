import { afterEach, describe, expect, it, vi } from "vitest";

import { createFeAdditionalCostDraftFromForm } from "@/features/fe-requisitions/form/lib/create-fe-additional-cost-draft-from-form";
import type { FeAdditionalCostForm } from "@/features/fe-requisitions/form/types/fe-additional-cost-form";

describe("createFeAdditionalCostDraftFromForm", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates a new job additional cost draft row and normalises mileage fields", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000107",
        );

        const form: FeAdditionalCostForm = {
            weekEndingDate: new Date(2026, 5, 14),

            reasonId: "reason-id",
            reasonCode: "200",
            reasonText: "Parking",
            isReasonActive: false,

            chargingOption: "Job",

            totalNumber: 3,
            ratePerJob: 10,

            miles: 99,
            ratePerMile: 99,
        };

        const result = createFeAdditionalCostDraftFromForm({ form });

        expect(result).toEqual({
            id: null,
            clientId: "00000000-0000-4000-8000-000000000107",

            weekEndingDate: form.weekEndingDate,

            reasonId: "reason-id",
            reasonText: "Parking",
            reasonCode: "200",
            isReasonActive: false,

            chargingOption: "Job",

            totalNumber: 3,
            ratePerJob: 10,

            miles: null,
            ratePerMile: null,

            totalValue: 30,
        });
    });

    it("creates a new mileage additional cost draft row and normalises job fields", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000108",
        );

        const form: FeAdditionalCostForm = {
            weekEndingDate: new Date(2026, 5, 14),

            reasonId: "reason-id",
            reasonCode: "300",
            reasonText: "Mileage reason",
            isReasonActive: true,

            chargingOption: "Mileage",

            totalNumber: 99,
            ratePerJob: 99,

            miles: 40,
            ratePerMile: 0.5,
        };

        const result = createFeAdditionalCostDraftFromForm({ form });

        expect(result).toEqual({
            id: null,
            clientId: "00000000-0000-4000-8000-000000000108",

            weekEndingDate: form.weekEndingDate,

            reasonId: "reason-id",
            reasonText: "Mileage reason",
            reasonCode: "300",
            isReasonActive: true,

            chargingOption: "Mileage",

            totalNumber: null,
            ratePerJob: null,

            miles: 40,
            ratePerMile: 0.5,

            totalValue: 20,
        });
    });

    it("treats missing charge values as zero for total value", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000109",
        );

        const form: FeAdditionalCostForm = {
            weekEndingDate: new Date(2026, 5, 14),

            reasonId: "reason-id",
            reasonCode: "300",
            reasonText: "Mileage reason",
            isReasonActive: true,

            chargingOption: "Mileage",

            totalNumber: 99,
            ratePerJob: 99,

            miles: null,
            ratePerMile: null,
        };

        const result = createFeAdditionalCostDraftFromForm({ form });

        expect(result.clientId).toBe("00000000-0000-4000-8000-000000000109");
        expect(result.id).toBeNull();

        expect(result.chargingOption).toBe("Mileage");
        expect(result.totalNumber).toBeNull();
        expect(result.ratePerJob).toBeNull();
        expect(result.miles).toBeNull();
        expect(result.ratePerMile).toBeNull();

        expect(result.totalValue).toBe(0);
    });
});