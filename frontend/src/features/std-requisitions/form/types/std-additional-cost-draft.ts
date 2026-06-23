import type { StdChargeType } from "../../constants/std-charge-type.constants";

export type StdAdditionalCostDraft = {
    clientId: string;
    id: string | null;

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

    totalValue: number;
};