import { describe, expect, it } from "vitest";

import { mapStdCollectionChargeBanksAndBinsDraftToForm } from "@/features/std-requisitions/form/lib/map-std-collection-charge-banks-and-bins-draft-to-form";
import type { StdCollectionChargeBanksAndBinsDraft } from "@/features/std-requisitions/form/types/std-collection-charge-banks-and-bins-draft";

describe("mapStdCollectionChargeBanksAndBinsDraftToForm", () => {
    it("maps banks and bins draft fields to form fields and omits draft-only fields", () => {
        const row: StdCollectionChargeBanksAndBinsDraft = {
            id: "banks-id",
            clientId: "banks-client-id",
            date: new Date(2026, 5, 14),

            collectionTypeId: "collection-type-id",
            collectionTypeLabel: "Banks",
            collectionTypeCode: "BANKS",
            isCollectionTypeActive: false,

            locationId: "location-id",
            locationLabel: "Location A",
            locationPostCode: "AB1 2CD",
            isLocationActive: true,

            numberOfBags: 4,

            chargeType: "Mileage",
            miles: 40,
            ratePerMile: 0.5,
            flatCharge: null,

            totalValue: 20,
        };

        const result = mapStdCollectionChargeBanksAndBinsDraftToForm(row);

        expect(result).toEqual({
            date: row.date,

            collectionTypeId: "collection-type-id",
            collectionTypeLabel: "Banks",
            collectionTypeCode: "BANKS",
            isCollectionTypeActive: false,

            locationId: "location-id",
            locationLabel: "Location A",
            locationPostCode: "AB1 2CD",
            isLocationActive: true,

            numberOfBags: 4,

            chargeType: "Mileage",

            miles: 40,
            ratePerMile: 0.5,
            flatCharge: null,
        });
    });
});