import type { StdAdditionalCostDraft } from "../types/std-additional-cost-draft";
import type { StdAdditionalCostForm } from "../types/std-additional-cost-form";
import { calculateStdAdditionalCostFormTotal } from "./calculate-std-additional-cost-form";
import { normaliseStdChargeFields } from "./normalise-std-charge-fields";

export function createStdAdditionalCostDraftFromForm(
    form: StdAdditionalCostForm,
): StdAdditionalCostDraft {
    const chargeFields = normaliseStdChargeFields(form);

    return {
        clientId: crypto.randomUUID(),
        id: null,

        date: form.date,

        reasonId: form.reasonId,
        reasonName: form.reasonName,

        numberOfBags: form.numberOfBags,

        ...chargeFields,

        totalValue: calculateStdAdditionalCostFormTotal(form),
    };
}