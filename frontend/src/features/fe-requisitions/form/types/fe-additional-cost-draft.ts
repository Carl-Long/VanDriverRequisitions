import { ChargingOption } from "../../types/fe-requisition.types";

export type FeAdditionalCostDraft = {
    id: string | null;
    clientId: string;

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

    totalValue: number;
};