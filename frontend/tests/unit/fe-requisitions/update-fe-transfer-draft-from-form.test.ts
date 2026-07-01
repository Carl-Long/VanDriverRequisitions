import { describe, expect, it } from "vitest";

import { updateFeTransferDraftFromForm } from "@/features/fe-requisitions/form/lib/update-fe-transfer-draft-from-form";
import type { FeTransferDraft } from "@/features/fe-requisitions/form/types/fe-transfer-draft";
import type { FeTransferForm } from "@/features/fe-requisitions/form/types/fe-transfer-form";

describe("updateFeTransferDraftFromForm", () => {
    it("preserves row identity while updating shops, form fields, and totals", () => {
        const existing: FeTransferDraft = {
            id: "transfer-id",
            clientId: "transfer-client-id",

            shopIdFrom: "old-from-shop-id",
            shopLabelFrom: "001 - Old From",
            isShopFromActive: true,

            shopIdTo: "old-to-shop-id",
            shopLabelTo: "002 - Old To",
            isShopToActive: true,

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

            totalNumber: 0,
            ratePerJob: 1,
            totalValue: 0,
        };

        const form: FeTransferForm = {
            shopIdFrom: "new-from-shop-id",
            shopLabelFrom: "101 - New From",
            isShopFromActive: false,

            shopIdTo: "new-to-shop-id",
            shopLabelTo: "102 - New To",
            isShopToActive: true,

            weekEndingDate: new Date(2026, 5, 13),
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

        const result = updateFeTransferDraftFromForm(existing, form);

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);

        expect(result.shopIdFrom).toBe("new-from-shop-id");
        expect(result.shopLabelFrom).toBe("101 - New From");
        expect(result.isShopFromActive).toBe(false);

        expect(result.shopIdTo).toBe("new-to-shop-id");
        expect(result.shopLabelTo).toBe("102 - New To");
        expect(result.isShopToActive).toBe(true);

        expect(result.weekEndingDate).toBe(form.weekEndingDate);
        expect(result.quantities).toEqual(form.quantities);
        expect(result.ratePerJob).toBe(3);

        expect(result.totalNumber).toBe(11);
        expect(result.totalValue).toBe(33);
    });

    it("treats null quantities and null rate as zero for totals", () => {
        const existing: FeTransferDraft = {
            id: null,
            clientId: "client-id",

            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From",
            isShopFromActive: true,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To",
            isShopToActive: true,

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

            totalNumber: 7,
            ratePerJob: 10,
            totalValue: 70,
        };

        const form: FeTransferForm = {
            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From",
            isShopFromActive: true,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To",
            isShopToActive: true,

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

            ratePerJob: null,
        };

        const result = updateFeTransferDraftFromForm(existing, form);

        expect(result.totalNumber).toBe(0);
        expect(result.totalValue).toBe(0);
    });
});