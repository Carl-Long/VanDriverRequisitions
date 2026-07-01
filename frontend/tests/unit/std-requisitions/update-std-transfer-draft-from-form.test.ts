import { describe, expect, it } from "vitest";

import { updateStdTransferDraftFromForm } from "@/features/std-requisitions/form/lib/update-std-transfer-draft-from-form";
import type { StdTransferDraft } from "@/features/std-requisitions/form/types/std-transfer-draft";
import type { StdTransferForm } from "@/features/std-requisitions/form/types/std-transfer-form";

describe("updateStdTransferDraftFromForm", () => {
    it("preserves row identity, updates shops, normalises mileage fields, and recalculates total value", () => {
        const existing: StdTransferDraft = {
            id: "transfer-id",
            clientId: "transfer-client-id",
            date: new Date(2026, 5, 13),

            shopIdFrom: "old-from-id",
            shopLabelFrom: "001 - Old From",
            shopCodeFrom: "001",
            shopNameFrom: "Old From",
            isShopFromActive: true,

            shopIdTo: "old-to-id",
            shopLabelTo: "002 - Old To",
            shopCodeTo: "002",
            shopNameTo: "Old To",
            isShopToActive: true,

            numberOfBags: 1,
            numberOfBoxes: 1,

            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 20,

            totalValue: 20,
        };

        const form: StdTransferForm = {
            date: new Date(2026, 5, 14),

            shopIdFrom: "new-from-id",
            shopLabelFrom: "101 - New From",
            shopCodeFrom: "101",
            shopNameFrom: "New From",
            isShopFromActive: false,

            shopIdTo: "new-to-id",
            shopLabelTo: "102 - New To",
            shopCodeTo: "102",
            shopNameTo: "New To",
            isShopToActive: true,

            numberOfBags: 3,
            numberOfBoxes: 2,

            chargeType: "Mileage",
            miles: 30,
            ratePerMile: 0.5,
            flatCharge: 99,
        };

        const result = updateStdTransferDraftFromForm(existing, form);

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);

        expect(result.date).toBe(form.date);

        expect(result.shopIdFrom).toBe("new-from-id");
        expect(result.shopLabelFrom).toBe("101 - New From");
        expect(result.shopCodeFrom).toBe("101");
        expect(result.shopNameFrom).toBe("New From");
        expect(result.isShopFromActive).toBe(false);

        expect(result.shopIdTo).toBe("new-to-id");
        expect(result.shopLabelTo).toBe("102 - New To");
        expect(result.shopCodeTo).toBe("102");
        expect(result.shopNameTo).toBe("New To");
        expect(result.isShopToActive).toBe(true);

        expect(result.numberOfBags).toBe(3);
        expect(result.numberOfBoxes).toBe(2);

        expect(result.chargeType).toBe("Mileage");
        expect(result.miles).toBe(30);
        expect(result.ratePerMile).toBe(0.5);
        expect(result.flatCharge).toBeNull();

        expect(result.totalValue).toBe(15);
    });

    it("normalises flat charge fields and recalculates total value", () => {
        const existing: StdTransferDraft = {
            id: "transfer-id",
            clientId: "transfer-client-id",
            date: null,

            shopIdFrom: null,
            shopLabelFrom: null,
            shopCodeFrom: null,
            shopNameFrom: null,
            isShopFromActive: true,

            shopIdTo: null,
            shopLabelTo: null,
            shopCodeTo: null,
            shopNameTo: null,
            isShopToActive: true,

            numberOfBags: null,
            numberOfBoxes: null,

            chargeType: "Mileage",
            miles: 20,
            ratePerMile: 0.5,
            flatCharge: null,

            totalValue: 10,
        };

        const form: StdTransferForm = {
            date: new Date(2026, 5, 14),

            shopIdFrom: "from-id",
            shopLabelFrom: "001 - From",
            shopCodeFrom: "001",
            shopNameFrom: "From",
            isShopFromActive: true,

            shopIdTo: "to-id",
            shopLabelTo: "002 - To",
            shopCodeTo: "002",
            shopNameTo: "To",
            isShopToActive: false,

            numberOfBags: 4,
            numberOfBoxes: 5,

            chargeType: "FlatCharge",
            miles: 99,
            ratePerMile: 99,
            flatCharge: 25,
        };

        const result = updateStdTransferDraftFromForm(existing, form);

        expect(result.chargeType).toBe("FlatCharge");
        expect(result.miles).toBeNull();
        expect(result.ratePerMile).toBeNull();
        expect(result.flatCharge).toBe(25);
        expect(result.totalValue).toBe(25);
    });
});