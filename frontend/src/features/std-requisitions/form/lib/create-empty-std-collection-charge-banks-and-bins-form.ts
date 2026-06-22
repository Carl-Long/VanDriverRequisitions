import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
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

        chargeType: STD_CHARGE_TYPE.FlatCharge,

        miles: null,
        ratePerMile: null,
        flatCharge: null,
    };
}