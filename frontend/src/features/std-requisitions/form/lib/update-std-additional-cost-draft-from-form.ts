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
        reasonCode: form.reasonCode,
        reasonText: form.reasonText,
        isReasonActive: form.isReasonActive,

        numberOfBags: form.numberOfBags,

        ...normaliseStdChargeFields(form),

        totalValue: calculateStdAdditionalCostFormTotal(form),
    };
}