import { ChargingOption } from "../../types/fe-requisition.types";

export type FeAdditionalCostForm = {
    weekEndingDate: Date | null;

    reasonId: string | null;
    reasonText: string | null;

    chargingOption: ChargingOption;

    totalNumber: number | null;
    ratePerJob: number | null;

    miles: number | null;
    ratePerMile: number | null;
};