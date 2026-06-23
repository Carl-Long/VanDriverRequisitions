import type { StdChargeType } from "../../constants/std-charge-type.constants";

export type StdAdditionalCostForm = {
    date: Date | null;

    reasonId: string | null;
    reasonCode: string | null;
    reasonText: string | null;
    isReasonActive: boolean;
    
    numberOfBags: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;
};