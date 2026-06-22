import type { StdPickupDraft } from "../types/std-pickup-draft";
import type { StdPickupForm } from "../types/std-pickup-form";
import { calculateStdPickupFormTotal } from "./calculate-std-pickup-form";
import { normaliseStdChargeFields } from "./normalise-std-charge-fields";

export function updateStdPickupDraftFromForm(
    row: StdPickupDraft,
    form: StdPickupForm,
): StdPickupDraft {
    return {
        ...row,

        date: form.date,

        numberOfBags: form.numberOfBags,
        numberOfHouseholds: form.numberOfHouseholds,

        ...normaliseStdChargeFields(form),

        totalValue: calculateStdPickupFormTotal(form),
    };
}