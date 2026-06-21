import type { StdChargeType } from "../../constants/std-charge-type.constants";

export type StdTransferForm = {
    date: Date | null;

    shopIdFrom: string | null;
    shopLabelFrom: string | null;
    shopCodeFrom: string | null;
    shopNameFrom: string | null;

    shopIdTo: string | null;
    shopLabelTo: string | null;
    shopCodeTo: string | null;
    shopNameTo: string | null;

    numberOfBags: number | null;
    numberOfBoxes: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;
};