import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdAdditionalCostDraft } from "../types/std-additional-cost-draft";
import type { StdAdditionalCostForm } from "../types/std-additional-cost-form";

export function calculateStdAdditionalCostFormTotal(
    form: StdAdditionalCostForm,
) {
    if (form.chargeType === STD_CHARGE_TYPE.Mileage) {
        return (form.miles ?? 0) * (form.ratePerMile ?? 0);
    }

    return form.flatCharge ?? 0;
}

export function calculateStdAdditionalCostRowsTotal(
    rows: StdAdditionalCostDraft[],
) {
    return rows.reduce((total, row) => total + row.totalValue, 0);
}