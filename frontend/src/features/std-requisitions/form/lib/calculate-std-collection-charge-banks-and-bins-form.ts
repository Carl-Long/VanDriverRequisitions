import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import type { StdCollectionChargeBanksAndBinsDraft } from "../types/std-collection-charge-banks-and-bins-draft";

export function calculateStdCollectionChargeBanksAndBinsFormTotal(
    form: StdCollectionChargeBanksAndBinsForm,
) {
    if (form.chargeType === "Mileage") {
        return (form.miles ?? 0) * (form.ratePerMile ?? 0);
    }

    return form.flatCharge ?? 0;
}

export function calculateStdCollectionChargeBanksAndBinsRowsTotal(
    rows: StdCollectionChargeBanksAndBinsDraft[],
) {
    return rows.reduce((total, row) => total + (row.totalValue ?? 0), 0);
}