import type { FeTransferDraft } from "../types/fe-transfer-draft";
import type { FeTransferForm } from "../types/fe-transfer-form";
import { calculateFeTransferFormTotals } from "./calculate-fe-transfer-form";

export function updateFeTransferDraftFromForm(
    row: FeTransferDraft,
    form: FeTransferForm,
): FeTransferDraft {
    const totals = calculateFeTransferFormTotals(form);

    return {
        ...row,

        shopIdFrom: form.shopIdFrom,
        shopLabelFrom: form.shopLabelFrom,
        isShopFromActive: form.isShopFromActive,

        shopIdTo: form.shopIdTo,
        shopLabelTo: form.shopLabelTo,
        isShopToActive: form.isShopToActive,

        weekEndingDate: form.weekEndingDate,

        quantities: {
            ...form.quantities,
        },

        ratePerJob: form.ratePerJob,

        totalNumber: totals.totalNumber,
        totalValue: totals.totalValue,
    };
}