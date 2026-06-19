import type { StdCollectionChargeBanksAndBinsDraft } from "../types/std-collection-charge-banks-and-bins-draft";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import { calculateStdCollectionChargeBanksAndBinsFormTotal } from "./calculate-std-collection-charge-banks-and-bins-form";

type Args = {
    form: StdCollectionChargeBanksAndBinsForm;
};

export function createStdCollectionChargeBanksAndBinsDraftFromForm({
    form,
}: Args): StdCollectionChargeBanksAndBinsDraft {
    return {
        clientId: crypto.randomUUID(),
        id: null,

        date: form.date,

        collectionTypeId: form.collectionTypeId,
        collectionTypeLabel: form.collectionTypeLabel,
        collectionTypeCode: form.collectionTypeCode,

        locationId: form.locationId,
        locationLabel: form.locationLabel,
        locationPostCode: form.locationPostCode,

        numberOfBags: form.numberOfBags,

        chargeType: form.chargeType,

        miles: form.chargeType === "Mileage" ? form.miles : null,
        ratePerMile: form.chargeType === "Mileage" ? form.ratePerMile : null,
        flatCharge: form.chargeType === "FlatCharge" ? form.flatCharge : null,

        totalValue: calculateStdCollectionChargeBanksAndBinsFormTotal(form),
    };
}