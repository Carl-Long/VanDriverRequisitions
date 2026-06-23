import type { StdCollectionChargeBanksAndBinsDraft } from "../types/std-collection-charge-banks-and-bins-draft";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import { calculateStdChargeTotal } from "./calculate-std-charge-total";

export function calculateStdCollectionChargeBanksAndBinsFormTotal(
    form: StdCollectionChargeBanksAndBinsForm,
) {
    return calculateStdChargeTotal(form);
}

export function calculateStdCollectionChargeBanksAndBinsRowsTotal(
    rows: StdCollectionChargeBanksAndBinsDraft[],
) {
    return rows.reduce((total, row) => total + (row.totalValue ?? 0), 0);
}