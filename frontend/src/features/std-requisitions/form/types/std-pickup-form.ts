import type { StdChargeType } from "../../constants/std-charge-type.constants";

export type StdPickupForm = {
    date: Date | null;

    numberOfBags: number | null;
    numberOfHouseholds: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;
};