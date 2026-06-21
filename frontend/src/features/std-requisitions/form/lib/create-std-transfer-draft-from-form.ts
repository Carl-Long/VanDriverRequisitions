import type { StdTransferDraft } from "../types/std-transfer-draft";
import type { StdTransferForm } from "../types/std-transfer-form";
import { calculateStdTransferFormTotal } from "./calculate-std-transfer-form";
import { normaliseStdChargeFields } from "./normalise-std-charge-fields";

export function createStdTransferDraftFromForm(
    form: StdTransferForm,
): StdTransferDraft {
    const chargeFields = normaliseStdChargeFields(form);

    return {
        clientId: crypto.randomUUID(),
        id: null,

        date: form.date,

        shopIdFrom: form.shopIdFrom,
        shopLabelFrom: form.shopLabelFrom,
        shopCodeFrom: form.shopCodeFrom,
        shopNameFrom: form.shopNameFrom,

        shopIdTo: form.shopIdTo,
        shopLabelTo: form.shopLabelTo,
        shopCodeTo: form.shopCodeTo,
        shopNameTo: form.shopNameTo,

        numberOfBags: form.numberOfBags,
        numberOfBoxes: form.numberOfBoxes,

        ...chargeFields,

        totalValue: calculateStdTransferFormTotal(form),
    };
}