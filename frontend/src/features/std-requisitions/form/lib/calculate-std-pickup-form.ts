import type { StdPickupDraft } from "../types/std-pickup-draft";
import type { StdPickupForm } from "../types/std-pickup-form";

export function calculateStdPickupFormTotal(form: StdPickupForm) {
    if (form.chargeType === "Mileage") {
        return (form.miles ?? 0) * (form.ratePerMile ?? 0);
    }

    return form.flatCharge ?? 0;
}

export function calculateStdPickupRowsTotal(rows: StdPickupDraft[]) {
    return rows.reduce((total, row) => total + (row.totalValue ?? 0), 0);
}