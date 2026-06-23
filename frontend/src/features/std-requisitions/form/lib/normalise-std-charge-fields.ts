import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdChargeFields } from "../types/std-charge-fields";

export function normaliseStdChargeFields(charge: StdChargeFields): StdChargeFields {
    if (charge.chargeType === STD_CHARGE_TYPE.Mileage) {
        return {
            chargeType: charge.chargeType,
            miles: charge.miles,
            ratePerMile: charge.ratePerMile,
            flatCharge: null,
        };
    }

    return {
        chargeType: charge.chargeType,
        miles: null,
        ratePerMile: null,
        flatCharge: charge.flatCharge,
    };
}