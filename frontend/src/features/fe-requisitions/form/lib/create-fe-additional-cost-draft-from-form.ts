import { FeAdditionalCostDraft } from "../types/fe-additional-cost-draft";
import { FeAdditionalCostForm } from "../types/fe-additional-cost-form";
import { calculateFeAdditionalCostFormTotals } from "./calculate-fe-additional-cost.form";


type Params = {
    form: FeAdditionalCostForm;
};

export function createFeAdditionalCostDraftFromForm({
    form,
}: Params): FeAdditionalCostDraft {
    const totals = calculateFeAdditionalCostFormTotals(form);

    return {
        id: null,
        clientId: crypto.randomUUID(),

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