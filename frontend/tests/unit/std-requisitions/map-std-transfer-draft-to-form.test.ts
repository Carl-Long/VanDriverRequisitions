import { describe, expect, it } from "vitest";

import { mapStdTransferDraftToForm } from "@/features/std-requisitions/form/lib/map-std-transfer-draft-to-form";
import type { StdTransferDraft } from "@/features/std-requisitions/form/types/std-transfer-draft";

describe("mapStdTransferDraftToForm", () => {
    it("maps transfer draft fields to form fields and omits draft-only fields", () => {
        const row: StdTransferDraft = {
            id: "transfer-id",
            clientId: "transfer-client-id",
            date: new Date(2026, 5, 14),

            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From Shop",
            shopCodeFrom: "001",
            shopNameFrom: "From Shop",
            isShopFromActive: false,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To Shop",
            shopCodeTo: "002",
            shopNameTo: "To Shop",
            isShopToActive: true,

            numberOfBags: 3,
            numberOfBoxes: 2,

            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 25,

            totalValue: 25,
        };

        const result = mapStdTransferDraftToForm(row);

        expect(result).toEqual({
            date: row.date,

            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From Shop",
            shopCodeFrom: "001",
            shopNameFrom: "From Shop",
            isShopFromActive: false,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To Shop",
            shopCodeTo: "002",
            shopNameTo: "To Shop",
            isShopToActive: true,

            numberOfBags: 3,
            numberOfBoxes: 2,

            chargeType: "FlatCharge",

            miles: null,
            ratePerMile: null,
            flatCharge: 25,
        });
    });
});