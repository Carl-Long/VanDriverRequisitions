import { FeTransferForm } from "../types/fe-transfer-form";
import { getUpcomingSaturday } from "./get-upcoming-saturday";

export function createEmptyFeTransferForm(
    weekEndingDate: Date | null = null,
): FeTransferForm {
    return {
        shopIdFrom: null,
        shopLabelFrom: null,
        isShopFromActive: true,

        shopIdTo: null,
        shopLabelTo: null,
        isShopToActive: true,

        weekEndingDate: weekEndingDate ?? getUpcomingSaturday(),

        quantities: {
            sunday: null,
            monday: null,
            tuesday: null,
            wednesday: null,
            thursday: null,
            friday: null,
            saturday: null,
        },

        ratePerJob: null,
    };
}