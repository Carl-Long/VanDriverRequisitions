import type { StdPickupDraft } from "../types/std-pickup-draft";
import type { StdPickupForm } from "../types/std-pickup-form";

export function mapStdPickupDraftToForm(row: StdPickupDraft): StdPickupForm {
    return {
        date: row.date,

        numberOfBags: row.numberOfBags,
        numberOfHouseholds: row.numberOfHouseholds,

        chargeType: row.chargeType,

        miles: row.miles,
        ratePerMile: row.ratePerMile,
        flatCharge: row.flatCharge,
    };
}