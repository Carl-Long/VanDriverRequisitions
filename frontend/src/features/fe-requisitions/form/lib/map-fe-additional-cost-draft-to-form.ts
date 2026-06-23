import { FeAdditionalCostDraft } from "../types/fe-additional-cost-draft";
import { FeAdditionalCostForm } from "../types/fe-additional-cost-form";

export function mapFeAdditionalCostDraftToForm(
    row: FeAdditionalCostDraft,
): FeAdditionalCostForm {
    return {
        weekEndingDate: row.weekEndingDate,

        reasonId: row.reasonId,
        reasonText: row.reasonText,
        reasonCode: row.reasonCode,
        isReasonActive: row.isReasonActive,

        chargingOption: row.chargingOption,

        totalNumber: row.totalNumber,
        ratePerJob: row.ratePerJob,

        miles: row.miles,
        ratePerMile: row.ratePerMile,
    };
}