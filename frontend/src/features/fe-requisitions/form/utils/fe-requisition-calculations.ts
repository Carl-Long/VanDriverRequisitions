import { sumTotalValues } from "@/features/requisitions-shared/lib/sum-total-values";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";

export function calculateFeRequisitionSubtotal(draft: FeRequisitionDraft): number {
    return (
        sumTotalValues(draft.feGeneralTasks) +
        sumTotalValues(draft.feMileages) +
        sumTotalValues(draft.feTransfers) +
        sumTotalValues(draft.feAdditionalCosts)
    );
}