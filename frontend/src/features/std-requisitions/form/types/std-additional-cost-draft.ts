import type { StdChargeType } from "../../constants/std-charge-type.constants";

export type StdAdditionalCostDraft = {
    clientId: string;
    id: string | null;

    date: Date | null;

    reasonId: string | null;
    reasonName: string | null;

    numberOfBags: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;

    totalValue: number;
};