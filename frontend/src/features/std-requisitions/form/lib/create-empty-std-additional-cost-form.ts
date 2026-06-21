import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdAdditionalCostForm } from "../types/std-additional-cost-form";

export function createEmptyStdAdditionalCostForm(
    date: Date | null = null,
): StdAdditionalCostForm {
    return {
        date: date ?? new Date(),

        reasonId: null,
        reasonName: null,

        numberOfBags: null,

        chargeType: STD_CHARGE_TYPE.Mileage,

        miles: null,
        ratePerMile: null,
        flatCharge: null,
    };
}