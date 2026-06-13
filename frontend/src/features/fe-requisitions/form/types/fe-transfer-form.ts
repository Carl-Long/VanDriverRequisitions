import { WeeklyQuantitiesForm } from "./fe-general-task-form";

export type FeTransferForm = {
    shopIdFrom: string | null;
    shopLabelFrom: string | null;

    shopIdTo: string | null;
    shopLabelTo: string | null;

    weekEndingDate: Date | null;
    quantities: WeeklyQuantitiesForm;

    ratePerJob: number | null;
};