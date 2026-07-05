import { describe, expect, it } from "vitest";

import { updateStdCollectionChargeBanksAndBinsDraftFromForm } from "@/features/std-requisitions/form/lib/update-std-collection-charge-banks-and-bins-draft-from-form";
import type { StdCollectionChargeBanksAndBinsDraft } from "@/features/std-requisitions/form/types/std-collection-charge-banks-and-bins-draft";
import type { StdCollectionChargeBanksAndBinsForm } from "@/features/std-requisitions/form/types/std-collection-charge-banks-and-bins-form";

describe("updateStdCollectionChargeBanksAndBinsDraftFromForm", () => {
    it("preserves row identity, updates lookups, normalises flat charge fields, and recalculates total value", () => {
        const existing: StdCollectionChargeBanksAndBinsDraft = {
            id: "banks-id",
            clientId: "banks-client-id",
            date: new Date(2026, 5, 13),

            collectionTypeId: "old-type-id",
            collectionTypeLabel: "Old Type",
            collectionTypeCode: "OLD",
            isCollectionTypeActive: true,

            locationId: "old-location-id",
            locationLabel: "Old Location",
            locationPostCode: "OLD 123",
            isLocationActive: true,
            isLocationLinkedToRequisitionShop: true,
            isLocationLinkedToCollectionType: true,

            numberOfBags: 1,

            chargeType: "Mileage",
            miles: 20,
            ratePerMile: 0.5,
            flatCharge: null,

            totalValue: 10,
        };

        const form: StdCollectionChargeBanksAndBinsForm = {
            date: new Date(2026, 5, 14),

            collectionTypeId: "new-type-id",
            collectionTypeLabel: "New Type",
            collectionTypeCode: "NEW",
            isCollectionTypeActive: false,

            locationId: "new-location-id",
            locationLabel: "New Location",
            locationPostCode: "AB1 2CD",
            isLocationActive: false,
            isLocationLinkedToRequisitionShop: false,
            isLocationLinkedToCollectionType: false,

            numberOfBags: 4,

            chargeType: "FlatCharge",
            miles: 99,
            ratePerMile: 99,
            flatCharge: 12,
        };

        const result = updateStdCollectionChargeBanksAndBinsDraftFromForm(
            existing,
            form,
        );

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);

        expect(result.date).toBe(form.date);

        expect(result.collectionTypeId).toBe("new-type-id");
        expect(result.collectionTypeLabel).toBe("New Type");
        expect(result.collectionTypeCode).toBe("NEW");
        expect(result.isCollectionTypeActive).toBe(false);

        expect(result.locationId).toBe("new-location-id");
        expect(result.locationLabel).toBe("New Location");
        expect(result.locationPostCode).toBe("AB1 2CD");
        expect(result.isLocationActive).toBe(false);
        expect(result.isLocationLinkedToRequisitionShop).toBe(false);
        expect(result.isLocationLinkedToCollectionType).toBe(false);

        expect(result.numberOfBags).toBe(4);

        expect(result.chargeType).toBe("FlatCharge");
        expect(result.miles).toBeNull();
        expect(result.ratePerMile).toBeNull();
        expect(result.flatCharge).toBe(12);

        expect(result.totalValue).toBe(12);
    });

    it("normalises mileage fields and recalculates total value", () => {
        const existing: StdCollectionChargeBanksAndBinsDraft = {
            id: "banks-id",
            clientId: "banks-client-id",
            date: null,

            collectionTypeId: null,
            collectionTypeLabel: null,
            collectionTypeCode: null,
            isCollectionTypeActive: true,

            locationId: null,
            locationLabel: null,
            locationPostCode: null,
            isLocationActive: true,
            isLocationLinkedToRequisitionShop: true,
            isLocationLinkedToCollectionType: true,


            numberOfBags: null,

            chargeType: "FlatCharge",
            miles: null,
            ratePerMile: null,
            flatCharge: 25,

            totalValue: 25,
        };

        const form: StdCollectionChargeBanksAndBinsForm = {
            date: new Date(2026, 5, 14),

            collectionTypeId: "type-id",
            collectionTypeLabel: "Banks",
            collectionTypeCode: "BANKS",
            isCollectionTypeActive: true,

            locationId: "location-id",
            locationLabel: "Location",
            locationPostCode: "AB1 2CD",
            isLocationActive: true,
            isLocationLinkedToRequisitionShop: true,
            isLocationLinkedToCollectionType: true,

            numberOfBags: 3,

            chargeType: "Mileage",
            miles: 40,
            ratePerMile: 0.5,
            flatCharge: 99,
        };

        const result = updateStdCollectionChargeBanksAndBinsDraftFromForm(
            existing,
            form,
        );

        expect(result.chargeType).toBe("Mileage");
        expect(result.miles).toBe(40);
        expect(result.ratePerMile).toBe(0.5);
        expect(result.flatCharge).toBeNull();
        expect(result.totalValue).toBe(20);
    });
});