import { WeeklyQuantitiesDraft } from "./fe-general-task-draft";

export type FeTransferDraft = {
    id: string | null;
    clientId: string;

    shopIdFrom: string | null;
    shopLabelFrom: string | null;
    isShopFromActive: boolean;

    shopIdTo: string | null;
    shopLabelTo: string | null;
    isShopToActive: boolean;

    weekEndingDate: Date | null;
    quantities: WeeklyQuantitiesDraft;

    totalNumber: number;
    ratePerJob: number | null;
    totalValue: number;
};