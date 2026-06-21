import type { StdChargeType } from "../../constants/std-charge-type.constants";

export type StdChargeFields = {
    chargeType: StdChargeType;
    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;
};