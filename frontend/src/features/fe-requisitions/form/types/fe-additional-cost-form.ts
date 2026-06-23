import { ChargingOption } from "../../types/fe-requisition.types";

export type FeAdditionalCostForm = {
    weekEndingDate: Date | null;

    reasonId: string | null;
    reasonCode: string | null;
    reasonText: string | null;
    isReasonActive: boolean;

    chargingOption: ChargingOption;

    totalNumber: number | null;
    ratePerJob: number | null;

    miles: number | null;
    ratePerMile: number | null;
};