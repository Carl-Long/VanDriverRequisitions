import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdPickupForm } from "../types/std-pickup-form";

export function createEmptyStdPickupForm(
    date: Date | null = null,
): StdPickupForm {
    return {
        date: date ?? new Date(),
        numberOfBags: null,
        numberOfHouseholds: null,
        chargeType: STD_CHARGE_TYPE.FlatCharge,
        miles: null,
        ratePerMile: null,
        flatCharge: null,
    };
}