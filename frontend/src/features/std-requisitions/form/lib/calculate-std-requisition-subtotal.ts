import type { StdRequisitionDraft } from "../types/std-requisition-draft";
import { calculateStdCollectionChargeBanksAndBinsRowsTotal } from "./calculate-std-collection-charge-banks-and-bins-form";
import { calculateStdCollectionVanPackRowsTotal } from "./calculate-std-collection-van-pack-form";
import { calculateStdPickupRowsTotal } from "./calculate-std-pickup-form";

export function calculateStdRequisitionSubtotal(draft: StdRequisitionDraft) {
    return (
        calculateStdCollectionChargeBanksAndBinsRowsTotal(draft.collectionChargesBanksAndBins,) 
        + calculateStdCollectionVanPackRowsTotal(draft.collectionVanPacks)
        + calculateStdPickupRowsTotal(draft.pickups)
    );
}