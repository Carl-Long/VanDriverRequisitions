import { afterEach, describe, expect, it, vi } from "vitest";

import { createStdTransferDraftFromForm } from "@/features/std-requisitions/form/lib/create-std-transfer-draft-from-form";
import type { StdTransferForm } from "@/features/std-requisitions/form/types/std-transfer-form";

describe("createStdTransferDraftFromForm", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates a new mileage transfer draft row", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000003",
        );

        const form: StdTransferForm = {
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

            chargeType: "Mileage",
            miles: 30,
            ratePerMile: 0.5,
            flatCharge: 99,
        };

        const result = createStdTransferDraftFromForm(form);

        expect(result).toEqual({
            clientId: "00000000-0000-4000-8000-000000000003",
            id: null,

            date: form.date,

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

            chargeType: "Mileage",
            miles: 30,
            ratePerMile: 0.5,
            flatCharge: null,

            totalValue: 15,
        });
    });

    it("creates a new flat-charge transfer draft row", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000004",
        );

        const form: StdTransferForm = {
            date: new Date(2026, 5, 14),

            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From Shop",
            shopCodeFrom: "001",
            shopNameFrom: "From Shop",
            isShopFromActive: true,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To Shop",
            shopCodeTo: "002",
            shopNameTo: "To Shop",
            isShopToActive: false,

            numberOfBags: 4,
            numberOfBoxes: 5,

            chargeType: "FlatCharge",
            miles: 99,
            ratePerMile: 99,
            flatCharge: 25,
        };

        const result = createStdTransferDraftFromForm(form);

        expect(result).toEqual({
            clientId: "00000000-0000-4000-8000-000000000004",
            id: null,

            date: form.date,

            shopIdFrom: "from-shop-id",
            shopLabelFrom: "001 - From Shop",
            shopCodeFrom: "001",
            shopNameFrom: "From Shop",
            isShopFromActive: true,

            shopIdTo: "to-shop-id",
            shopLabelTo: "002 - To Shop",
            shopCodeTo: "002",
            shopNameTo: "To Shop",
            isShopToActive: false,

            numberOfBags: 4,
            numberOfBoxes: 5,

            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 25,

            totalValue: 25,
        });
    });
});