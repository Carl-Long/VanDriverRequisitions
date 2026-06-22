import type { StdCollectionChargeBanksAndBinsDraft } from "../types/std-collection-charge-banks-and-bins-draft";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import { calculateStdCollectionChargeBanksAndBinsFormTotal } from "./calculate-std-collection-charge-banks-and-bins-form";
import { normaliseStdChargeFields } from "./normalise-std-charge-fields";

export function updateStdCollectionChargeBanksAndBinsDraftFromForm(
    row: StdCollectionChargeBanksAndBinsDraft,
    form: StdCollectionChargeBanksAndBinsForm,
): StdCollectionChargeBanksAndBinsDraft {
    return {
        ...row,

        date: form.date,

        collectionTypeId: form.collectionTypeId,
        collectionTypeLabel: form.collectionTypeLabel,
        collectionTypeCode: form.collectionTypeCode,

        locationId: form.locationId,
        locationLabel: form.locationLabel,
        locationPostCode: form.locationPostCode,

        numberOfBags: form.numberOfBags,

        ...normaliseStdChargeFields(form),

        totalValue: calculateStdCollectionChargeBanksAndBinsFormTotal(form),
    };
}