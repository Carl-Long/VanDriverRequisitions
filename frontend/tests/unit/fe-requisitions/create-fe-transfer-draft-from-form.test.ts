import { afterEach, describe, expect, it, vi } from "vitest";

import { createFeTransferDraftFromForm } from "@/features/fe-requisitions/form/lib/create-fe-transfer-draft-from-form";
import type { FeTransferForm } from "@/features/fe-requisitions/form/types/fe-transfer-form";

describe("createFeTransferDraftFromForm", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates a new transfer draft row with shop fields and calculated totals", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000105",
        );

        const form: FeTransferForm = {
            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From Shop",
            isShopFromActive: false,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To Shop",
            isShopToActive: true,

            weekEndingDate: new Date(2026, 5, 14),

            quantities: {
                sunday: 1,
                monday: 1,
                tuesday: 2,
                wednesday: null,
                thursday: 3,
                friday: 0,
                saturday: 4,
            },

            ratePerJob: 3,
        };

        const result = createFeTransferDraftFromForm({ form });

        expect(result).toEqual({
            id: null,
            clientId: "00000000-0000-4000-8000-000000000105",

            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From Shop",
            isShopFromActive: false,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To Shop",
            isShopToActive: true,

            weekEndingDate: form.weekEndingDate,

            quantities: {
                sunday: 1,
                monday: 1,
                tuesday: 2,
                wednesday: null,
                thursday: 3,
                friday: 0,
                saturday: 4,
            },

            totalNumber: 11,
            ratePerJob: 3,
            totalValue: 33,
        });
    });

    it("treats null quantities and null rate as zero for totals", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000106",
        );

        const form: FeTransferForm = {
            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From Shop",
            isShopFromActive: true,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To Shop",
            isShopToActive: true,

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

            ratePerJob: null,
        };

        const result = createFeTransferDraftFromForm({ form });

        expect(result.clientId).toBe("00000000-0000-4000-8000-000000000106");
        expect(result.id).toBeNull();
        expect(result.totalNumber).toBe(0);
        expect(result.totalValue).toBe(0);
    });
});