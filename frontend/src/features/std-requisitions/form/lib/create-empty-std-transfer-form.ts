import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { StdTransferForm } from "../types/std-transfer-form";

export function createEmptyStdTransferForm(
    date: Date | null = null,
): StdTransferForm {
    return {
        date: date ?? new Date(),

        shopIdFrom: null,
        shopLabelFrom: null,
        shopCodeFrom: null,
        shopNameFrom: null,

        shopIdTo: null,
        shopLabelTo: null,
        shopCodeTo: null,
        shopNameTo: null,

        numberOfBags: null,
        numberOfBoxes: null,

        chargeType: STD_CHARGE_TYPE.Mileage,

        miles: null,
        ratePerMile: null,
        flatCharge: null,
    };
}