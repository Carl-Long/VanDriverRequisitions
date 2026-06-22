import type { StdCollectionChargeBanksAndBinsDraft } from "../types/std-collection-charge-banks-and-bins-draft";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import { calculateStdCollectionChargeBanksAndBinsFormTotal } from "./calculate-std-collection-charge-banks-and-bins-form";
import { normaliseStdChargeFields } from "./normalise-std-charge-fields";

type Args = {
    form: StdCollectionChargeBanksAndBinsForm;
};

export function createStdCollectionChargeBanksAndBinsDraftFromForm({
    form,
}: Args): StdCollectionChargeBanksAndBinsDraft {
    const chargeFields = normaliseStdChargeFields(form);

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

        ...chargeFields,

        totalValue: calculateStdCollectionChargeBanksAndBinsFormTotal(form),
    };
}