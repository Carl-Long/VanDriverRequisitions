import { describe, expect, it } from "vitest";

import { mapFeTransferDraftToForm } from "@/features/fe-requisitions/form/lib/map-fe-transfer-draft-to-form";
import type { FeTransferDraft } from "@/features/fe-requisitions/form/types/fe-transfer-draft";

describe("mapFeTransferDraftToForm", () => {
    it("maps transfer draft fields to form fields and omits draft-only fields", () => {
        const row: FeTransferDraft = {
            id: "transfer-id",
            clientId: "transfer-client-id",

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

            totalNumber: 11,
            ratePerJob: 3,
            totalValue: 33,
        };

        const result = mapFeTransferDraftToForm(row);

        expect(result).toEqual({
            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From Shop",
            isShopFromActive: false,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To Shop",
            isShopToActive: true,

            weekEndingDate: row.weekEndingDate,

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
        });
    });

    it("copies quantities rather than reusing the same object reference", () => {
        const row: FeTransferDraft = {
            id: "transfer-id",
            clientId: "transfer-client-id",

            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From Shop",
            isShopFromActive: true,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To Shop",
            isShopToActive: true,

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

            totalNumber: 28,
            ratePerJob: 2,
            totalValue: 56,
        };

        const result = mapFeTransferDraftToForm(row);

        expect(result.quantities).toEqual(row.quantities);
        expect(result.quantities).not.toBe(row.quantities);
    });
});