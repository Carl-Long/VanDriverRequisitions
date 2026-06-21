import type { StdPickupDraft } from "../types/std-pickup-draft";
import type { StdPickupForm } from "../types/std-pickup-form";
import { calculateStdPickupFormTotal } from "./calculate-std-pickup-form";

export function createStdPickupDraftFromForm(form: StdPickupForm): StdPickupDraft {
    return {
        clientId: crypto.randomUUID(),
        id: null,

        date: form.date,

        numberOfBags: form.numberOfBags,
        numberOfHouseholds: form.numberOfHouseholds,

        chargeType: form.chargeType,

        miles: form.chargeType === "Mileage" ? form.miles : null,
        ratePerMile: form.chargeType === "Mileage" ? form.ratePerMile : null,
        flatCharge: form.chargeType === "FlatCharge" ? form.flatCharge : null,

        totalValue: calculateStdPickupFormTotal(form),
    };
}