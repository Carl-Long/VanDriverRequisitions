import type { FeAdditionalCostDraft } from "../types/fe-additional-cost-draft";
import type { FeAdditionalCostForm } from "../types/fe-additional-cost-form";
import { calculateFeAdditionalCostFormTotals } from "./calculate-fe-additional-cost.form";

export function updateFeAdditionalCostDraftFromForm(
    row: FeAdditionalCostDraft,
    form: FeAdditionalCostForm,
): FeAdditionalCostDraft {
    const totals = calculateFeAdditionalCostFormTotals(form);

    return {
        ...row,

        weekEndingDate: form.weekEndingDate,

        reasonId: form.reasonId,
        reasonText: form.reasonText,
        reasonCode: form.reasonCode,
        isReasonActive: form.isReasonActive,

        chargingOption: form.chargingOption,

        totalNumber: form.chargingOption === "Job" ? form.totalNumber : null,
        ratePerJob: form.chargingOption === "Job" ? form.ratePerJob : null,

        miles: form.chargingOption === "Mileage" ? form.miles : null,
        ratePerMile: form.chargingOption === "Mileage" ? form.ratePerMile : null,

        totalValue: totals.totalValue,
    };
}