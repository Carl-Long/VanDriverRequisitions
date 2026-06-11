import { FeMileageDraft } from "../types/fe-mileage-draft";
import { FeMileageForm } from "../types/fe-mileage-form";
import { calculateFeMileageFormTotals } from "./calculate-fe-mileage-form";

type Params = { form: FeMileageForm };

export function createFeMileageDraftFromForm({ form }: Params): FeMileageDraft {
    const totals = calculateFeMileageFormTotals(form);

    return {
        id: null,
        clientId: crypto.randomUUID(),
        weekEndingDate: form.weekEndingDate,
        quantities: {
            sunday: form.quantities.sunday,
            monday: form.quantities.monday,
            tuesday: form.quantities.tuesday,
            wednesday: form.quantities.wednesday,
            thursday: form.quantities.thursday,
            friday: form.quantities.friday,
            saturday: form.quantities.saturday,
        },
        totalMiles: totals.totalMiles,
        ratePerMile: form.ratePerMile,
        totalValue: totals.totalValue,
    };
}
