import type { StdTransferDraft } from "../types/std-transfer-draft";
import type { StdTransferForm } from "../types/std-transfer-form";
import { calculateStdTransferFormTotal } from "./calculate-std-transfer-form";
import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";

export function createStdTransferDraftFromForm(
    form: StdTransferForm,
): StdTransferDraft {
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

        chargeType: form.chargeType,

        miles: form.chargeType === STD_CHARGE_TYPE.Mileage ? form.miles : null,
        ratePerMile:
            form.chargeType === STD_CHARGE_TYPE.Mileage
                ? form.ratePerMile
                : null,
        flatCharge:
            form.chargeType === STD_CHARGE_TYPE.FlatCharge
                ? form.flatCharge
                : null,

        totalValue: calculateStdTransferFormTotal(form),
    };
}