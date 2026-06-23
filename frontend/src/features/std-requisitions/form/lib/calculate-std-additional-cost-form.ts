import type { StdAdditionalCostDraft } from "../types/std-additional-cost-draft";
import type { StdAdditionalCostForm } from "../types/std-additional-cost-form";
import { calculateStdChargeTotal } from "./calculate-std-charge-total";

export function calculateStdAdditionalCostFormTotal(
    form: StdAdditionalCostForm,
) {
    return calculateStdChargeTotal(form);
}

export function calculateStdAdditionalCostRowsTotal(
    rows: StdAdditionalCostDraft[],
) {
    return rows.reduce((total, row) => total + row.totalValue, 0);
}