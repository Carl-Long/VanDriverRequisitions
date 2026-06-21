import type { StdChargeType } from "../../constants/std-charge-type.constants";

export type StdPickupDraft = {
    clientId: string;
    id: string | null;

    date: Date | null;

    numberOfBags: number | null;
    numberOfHouseholds: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;

    totalValue: number;
};