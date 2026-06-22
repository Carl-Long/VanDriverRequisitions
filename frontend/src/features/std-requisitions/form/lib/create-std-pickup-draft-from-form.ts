import type { StdPickupDraft } from "../types/std-pickup-draft";
import type { StdPickupForm } from "../types/std-pickup-form";
import { calculateStdPickupFormTotal } from "./calculate-std-pickup-form";
import { normaliseStdChargeFields } from "./normalise-std-charge-fields";

export function createStdPickupDraftFromForm(form: StdPickupForm): StdPickupDraft {
    const chargeFields = normaliseStdChargeFields(form);

    return {
        clientId: crypto.randomUUID(),
        id: null,

        date: form.date,

        numberOfBags: form.numberOfBags,
        numberOfHouseholds: form.numberOfHouseholds,

        ...chargeFields,

        totalValue: calculateStdPickupFormTotal(form),
    };
}