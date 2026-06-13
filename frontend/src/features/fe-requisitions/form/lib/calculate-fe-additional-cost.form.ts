import { FeAdditionalCostForm } from "../types/fe-additional-cost-form";

export function calculateFeAdditionalCostFormTotals(form: FeAdditionalCostForm) {
    const totalValue =
        form.chargingOption === "Mileage"
            ? (form.miles ?? 0) * (form.ratePerMile ?? 0)
            : (form.totalNumber ?? 0) * (form.ratePerJob ?? 0);

    return {
        totalValue,
    };
}