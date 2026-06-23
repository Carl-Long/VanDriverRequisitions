import type { StdTransferDraft } from "../types/std-transfer-draft";
import type { StdTransferForm } from "../types/std-transfer-form";

export function mapStdTransferDraftToForm(
    row: StdTransferDraft,
): StdTransferForm {
    return {
        date: row.date,

        shopIdFrom: row.shopIdFrom,
        shopLabelFrom: row.shopLabelFrom,
        shopCodeFrom: row.shopCodeFrom,
        shopNameFrom: row.shopNameFrom,

        shopIdTo: row.shopIdTo,
        shopLabelTo: row.shopLabelTo,
        shopCodeTo: row.shopCodeTo,
        shopNameTo: row.shopNameTo,

        numberOfBags: row.numberOfBags,
        numberOfBoxes: row.numberOfBoxes,

        chargeType: row.chargeType,

        miles: row.miles,
        ratePerMile: row.ratePerMile,
        flatCharge: row.flatCharge,
    };
}