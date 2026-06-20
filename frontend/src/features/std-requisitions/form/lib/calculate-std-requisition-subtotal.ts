import type { StdRequisitionDraft } from "../types/std-requisition-draft";
import { calculateStdCollectionChargeBanksAndBinsRowsTotal } from "./calculate-std-collection-charge-banks-and-bins-form";
import { calculateStdCollectionVanPackRowsTotal } from "./calculate-std-collection-van-pack-form";

export function calculateStdRequisitionSubtotal(draft: StdRequisitionDraft) {
    return (
        calculateStdCollectionChargeBanksAndBinsRowsTotal(draft.collectionChargesBanksAndBins,) 
        + calculateStdCollectionVanPackRowsTotal(draft.collectionVanPacks)
    );
}