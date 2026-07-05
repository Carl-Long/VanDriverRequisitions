import type { StdCollectionChargeBanksAndBinsDraft } from "../types/std-collection-charge-banks-and-bins-draft";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";

export function mapStdCollectionChargeBanksAndBinsDraftToForm(
    row: StdCollectionChargeBanksAndBinsDraft,
): StdCollectionChargeBanksAndBinsForm {
    return {
        date: row.date,

        collectionTypeId: row.collectionTypeId,
        collectionTypeLabel: row.collectionTypeLabel,
        collectionTypeCode: row.collectionTypeCode,
        isCollectionTypeActive: row.isCollectionTypeActive,

        locationId: row.locationId,
        locationLabel: row.locationLabel,
        locationPostCode: row.locationPostCode,
        isLocationActive: row.isLocationActive,
        isLocationLinkedToRequisitionShop: row.isLocationLinkedToRequisitionShop,
        isLocationLinkedToCollectionType: row.isLocationLinkedToCollectionType,

        numberOfBags: row.numberOfBags,

        chargeType: row.chargeType,

        miles: row.miles,
        ratePerMile: row.ratePerMile,
        flatCharge: row.flatCharge,
    };
}