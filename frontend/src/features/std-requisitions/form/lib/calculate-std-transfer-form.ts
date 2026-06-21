import type { StdTransferDraft } from "../types/std-transfer-draft";
import type { StdTransferForm } from "../types/std-transfer-form";

export function calculateStdTransferFormTotal(form: StdTransferForm) {
    if (form.chargeType === "Mileage") {
        return (form.miles ?? 0) * (form.ratePerMile ?? 0);
    }

    return form.flatCharge ?? 0;
}

export function calculateStdTransferRowsTotal(rows: StdTransferDraft[]) {
    return rows.reduce((total, row) => total + row.totalValue, 0);
}