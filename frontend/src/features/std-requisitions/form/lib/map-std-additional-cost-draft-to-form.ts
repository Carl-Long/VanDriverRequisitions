import type { StdAdditionalCostDraft } from "../types/std-additional-cost-draft";
import type { StdAdditionalCostForm } from "../types/std-additional-cost-form";

export function mapStdAdditionalCostDraftToForm(
    row: StdAdditionalCostDraft,
): StdAdditionalCostForm {
    return {
        date: row.date,

        reasonId: row.reasonId,
        reasonName: row.reasonName,

        numberOfBags: row.numberOfBags,

        chargeType: row.chargeType,

        miles: row.miles,
        ratePerMile: row.ratePerMile,
        flatCharge: row.flatCharge,
    };
}