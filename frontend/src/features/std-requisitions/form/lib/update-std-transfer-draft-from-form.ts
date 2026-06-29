import type { StdTransferDraft } from "../types/std-transfer-draft";
import type { StdTransferForm } from "../types/std-transfer-form";
import { calculateStdTransferFormTotal } from "./calculate-std-transfer-form";
import { normaliseStdChargeFields } from "./normalise-std-charge-fields";

export function updateStdTransferDraftFromForm(
    row: StdTransferDraft,
    form: StdTransferForm,
): StdTransferDraft {
    return {
        ...row,

        date: form.date,

        shopIdFrom: form.shopIdFrom,
        shopLabelFrom: form.shopLabelFrom,
        shopCodeFrom: form.shopCodeFrom,
        shopNameFrom: form.shopNameFrom,
        isShopFromActive: form.isShopFromActive,

        shopIdTo: form.shopIdTo,
        shopLabelTo: form.shopLabelTo,
        shopCodeTo: form.shopCodeTo,
        shopNameTo: form.shopNameTo,
        isShopToActive: form.isShopToActive,

        numberOfBags: form.numberOfBags,
        numberOfBoxes: form.numberOfBoxes,

        ...normaliseStdChargeFields(form),

        totalValue: calculateStdTransferFormTotal(form),
    };
}