import { afterEach, describe, expect, it, vi } from "vitest";

import { createStdCollectionChargeBanksAndBinsDraftFromForm } from "@/features/std-requisitions/form/lib/create-std-collection-charge-banks-and-bins-draft-from-form";
import type { StdCollectionChargeBanksAndBinsForm } from "@/features/std-requisitions/form/types/std-collection-charge-banks-and-bins-form";

describe("createStdCollectionChargeBanksAndBinsDraftFromForm", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates a new flat-charge banks and bins draft row", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000005",
        );

        const form: StdCollectionChargeBanksAndBinsForm = {
            date: new Date(2026, 5, 14),

            collectionTypeId: "collection-type-id",
            collectionTypeLabel: "Banks",
            collectionTypeCode: "BANKS",
            isCollectionTypeActive: false,

            locationId: "location-id",
            locationLabel: "Location A",
            locationPostCode: "AB1 2CD",
            isLocationActive: false,

            numberOfBags: 4,

            chargeType: "FlatCharge",
            miles: 99,
            ratePerMile: 99,
            flatCharge: 12,
        };

        const result = createStdCollectionChargeBanksAndBinsDraftFromForm({
            form,
        });

        expect(result).toEqual({
            clientId: "00000000-0000-4000-8000-000000000005",
            id: null,

            date: form.date,

            collectionTypeId: "collection-type-id",
            collectionTypeLabel: "Banks",
            collectionTypeCode: "BANKS",
            isCollectionTypeActive: false,

            locationId: "location-id",
            locationLabel: "Location A",
            locationPostCode: "AB1 2CD",
            isLocationActive: false,

            numberOfBags: 4,

            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 12,

            totalValue: 12,
        });
    });

    it("creates a new mileage banks and bins draft row", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000006",
        );

        const form: StdCollectionChargeBanksAndBinsForm = {
            date: new Date(2026, 5, 14),

            collectionTypeId: "collection-type-id",
            collectionTypeLabel: "Bins",
            collectionTypeCode: "BINS",
            isCollectionTypeActive: true,

            locationId: "location-id",
            locationLabel: "Location B",
            locationPostCode: "SW1A 1AA",
            isLocationActive: true,

            numberOfBags: 3,

            chargeType: "Mileage",
            miles: 40,
            ratePerMile: 0.5,
            flatCharge: 99,
        };

        const result = createStdCollectionChargeBanksAndBinsDraftFromForm({
            form,
        });

        expect(result).toEqual({
            clientId: "00000000-0000-4000-8000-000000000006",
            id: null,

            date: form.date,

            collectionTypeId: "collection-type-id",
            collectionTypeLabel: "Bins",
            collectionTypeCode: "BINS",
            isCollectionTypeActive: true,

            locationId: "location-id",
            locationLabel: "Location B",
            locationPostCode: "SW1A 1AA",
            isLocationActive: true,

            numberOfBags: 3,

            chargeType: "Mileage",
            miles: 40,
            ratePerMile: 0.5,
            flatCharge: null,

            totalValue: 20,
        });
    });
});