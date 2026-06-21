import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdAdditionalCostDraft } from "../types/std-additional-cost-draft";
import type { StdAdditionalCostForm } from "../types/std-additional-cost-form";
import { calculateStdAdditionalCostFormTotal } from "./calculate-std-additional-cost-form";

export function createStdAdditionalCostDraftFromForm(
    form: StdAdditionalCostForm,
): StdAdditionalCostDraft {
    return {
        clientId: crypto.randomUUID(),
        id: null,

        date: form.date,

        reasonId: form.reasonId,
        reasonName: form.reasonName,

        numberOfBags: form.numberOfBags,

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

        totalValue: calculateStdAdditionalCostFormTotal(form),
    };
}