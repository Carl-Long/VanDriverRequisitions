import { FeAdditionalCostForm } from "../types/fe-additional-cost-form";
import { getUpcomingSaturday } from "./get-upcoming-saturday";

export function createEmptyFeAdditionalCostForm(
    weekEndingDate: Date | null = null,
): FeAdditionalCostForm {
    return {
        weekEndingDate: weekEndingDate ?? getUpcomingSaturday(),

        reasonId: null,
        reasonText: null,

        chargingOption: "Job",

        totalNumber: null,
        ratePerJob: null,

        miles: null,
        ratePerMile: null,
    };
}