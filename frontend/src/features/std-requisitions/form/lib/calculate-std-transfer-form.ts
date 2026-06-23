import type { StdTransferDraft } from "../types/std-transfer-draft";
import type { StdTransferForm } from "../types/std-transfer-form";
import { calculateStdChargeTotal } from "./calculate-std-charge-total";

export function calculateStdTransferFormTotal(form: StdTransferForm) {
    return calculateStdChargeTotal(form);
}

export function calculateStdTransferRowsTotal(rows: StdTransferDraft[]) {
    return rows.reduce((total, row) => total + row.totalValue, 0);
}