import { WeeklyQuantitiesForm } from "./fe-general-task-form";

export type FeTransferForm = {
    shopIdFrom: string | null;
    shopLabelFrom: string | null;
    isShopFromActive: boolean;

    shopIdTo: string | null;
    shopLabelTo: string | null;
    isShopToActive: boolean;

    weekEndingDate: Date | null;
    quantities: WeeklyQuantitiesForm;

    ratePerJob: number | null;
};