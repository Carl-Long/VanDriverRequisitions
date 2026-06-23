import type { StdPickupDraft } from "../types/std-pickup-draft";
import type { StdPickupForm } from "../types/std-pickup-form";
import { calculateStdChargeTotal } from "./calculate-std-charge-total";

export function calculateStdPickupFormTotal(form: StdPickupForm) {
    return calculateStdChargeTotal(form);
}

export function calculateStdPickupRowsTotal(rows: StdPickupDraft[]) {
    return rows.reduce((total, row) => total + (row.totalValue ?? 0), 0);
}