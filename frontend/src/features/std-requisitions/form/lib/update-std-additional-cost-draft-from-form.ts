import type { StdAdditionalCostDraft } from "../types/std-additional-cost-draft";
import type { StdAdditionalCostForm } from "../types/std-additional-cost-form";
import { calculateStdAdditionalCostFormTotal } from "./calculate-std-additional-cost-form";
import { normaliseStdChargeFields } from "./normalise-std-charge-fields";

export function updateStdAdditionalCostDraftFromForm(
    row: StdAdditionalCostDraft,
    form: StdAdditionalCostForm,
): StdAdditionalCostDraft {
    return {
        ...row,

        date: form.date,

        reasonId: form.reasonId,
        reasonName: form.reasonName,

        numberOfBags: form.numberOfBags,

        ...normaliseStdChargeFields(form),

        totalValue: calculateStdAdditionalCostFormTotal(form),
    };
}