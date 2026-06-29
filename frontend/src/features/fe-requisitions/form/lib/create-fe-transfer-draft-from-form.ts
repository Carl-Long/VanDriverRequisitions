import { FeTransferDraft } from "../types/fe-transfer-draft";
import { FeTransferForm } from "../types/fe-transfer-form";
import { calculateFeTransferFormTotals } from "./calculate-fe-transfer-form";

type Params = { form: FeTransferForm };

export function createFeTransferDraftFromForm({ form }: Params): FeTransferDraft {
    const totals = calculateFeTransferFormTotals(form);

    return {
        id: null,
        clientId: crypto.randomUUID(),

        shopIdFrom: form.shopIdFrom,
        shopLabelFrom: form.shopLabelFrom,
        isShopFromActive: form.isShopFromActive,

        shopIdTo: form.shopIdTo,
        shopLabelTo: form.shopLabelTo,
        isShopToActive: form.isShopToActive,

        weekEndingDate: form.weekEndingDate,

        quantities: {
            sunday: form.quantities.sunday,
            monday: form.quantities.monday,
            tuesday: form.quantities.tuesday,
            wednesday: form.quantities.wednesday,
            thursday: form.quantities.thursday,
            friday: form.quantities.friday,
            saturday: form.quantities.saturday,
        },

        totalNumber: totals.totalNumber,
        ratePerJob: form.ratePerJob,
        totalValue: totals.totalValue,
    };
}
