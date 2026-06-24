import { sumTotalValues } from "@/features/requisitions-shared/lib/sum-total-values";
import { StdRequisitionDraft } from "../types/std-requisition-draft";

export function calculateStdRequisitionSubtotal(draft: StdRequisitionDraft): number {
    return (
        sumTotalValues(draft.pickups) +
        sumTotalValues(draft.transfers) +
        sumTotalValues(draft.collectionChargesBanksAndBins) +
        sumTotalValues(draft.collectionVanPacks) +
        sumTotalValues(draft.additionalCosts)
    );
}