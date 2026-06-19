import type { StdRequisitionDraft } from "../types/std-requisition-draft";

export function calculateStdRequisitionSubtotal(draft: StdRequisitionDraft) {
    return draft.collectionChargesBanksAndBins.reduce(
        (total, row) => total + (row.totalValue ?? 0),
        0,
    );
}