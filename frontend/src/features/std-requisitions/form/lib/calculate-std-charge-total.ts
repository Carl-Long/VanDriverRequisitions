import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdChargeFields } from "../types/std-charge-fields";

export function calculateStdChargeTotal(charge: StdChargeFields) {
    if (charge.chargeType === STD_CHARGE_TYPE.Mileage) {
        return (charge.miles ?? 0) * (charge.ratePerMile ?? 0);
    }

    return charge.flatCharge ?? 0;
}