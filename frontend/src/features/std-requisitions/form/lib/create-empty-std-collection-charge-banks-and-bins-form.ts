import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";

export function createEmptyStdCollectionChargeBanksAndBinsForm(
    date: Date | null = null,
): StdCollectionChargeBanksAndBinsForm {
    return {
        date: date ?? new Date(),

        collectionTypeId: null,
        collectionTypeLabel: null,
        collectionTypeCode: null,

        locationId: null,
        locationLabel: null,
        locationPostCode: null,

        numberOfBags: null,

        chargeType: "Mileage",

        miles: null,
        ratePerMile: null,
        flatCharge: null,
    };
}