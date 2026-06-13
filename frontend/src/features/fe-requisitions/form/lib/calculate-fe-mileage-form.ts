import { FeMileageForm } from "../types/fe-mileage-form";

export function calculateFeMileageFormTotals(form: FeMileageForm) {
    const totalMiles =
        (form.quantities.sunday ?? 0) +
        (form.quantities.monday ?? 0) +
        (form.quantities.tuesday ?? 0) +
        (form.quantities.wednesday ?? 0) +
        (form.quantities.thursday ?? 0) +
        (form.quantities.friday ?? 0) +
        (form.quantities.saturday ?? 0);

    const totalValue = totalMiles * (form.ratePerMile ?? 0);

    return { totalMiles, totalValue };
}
