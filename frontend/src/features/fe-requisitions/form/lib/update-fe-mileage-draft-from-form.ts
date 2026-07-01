import type { FeMileageDraft } from "../types/fe-mileage-draft";
import type { FeMileageForm } from "../types/fe-mileage-form";
import { calculateFeMileageFormTotals } from "./calculate-fe-mileage-form";

export function updateFeMileageDraftFromForm(
    row: FeMileageDraft,
    form: FeMileageForm,
): FeMileageDraft {
    const totals = calculateFeMileageFormTotals(form);

    return {
        ...row,

        weekEndingDate: form.weekEndingDate,

        quantities: {
            ...form.quantities,
        },

        ratePerMile: form.ratePerMile,

        totalMiles: totals.totalMiles,
        totalValue: totals.totalValue,
    };
}