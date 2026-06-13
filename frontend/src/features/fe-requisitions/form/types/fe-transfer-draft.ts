import { WeeklyQuantitiesDraft } from "./fe-general-task-draft";

export type FeTransferDraft = {
    id: string | null;
    clientId: string;

    shopIdFrom: string | null;
    shopLabelFrom: string | null;

    shopIdTo: string | null;
    shopLabelTo: string | null;

    weekEndingDate: Date | null;
    quantities: WeeklyQuantitiesDraft;

    totalNumber: number;
    ratePerJob: number | null;
    totalValue: number;
};