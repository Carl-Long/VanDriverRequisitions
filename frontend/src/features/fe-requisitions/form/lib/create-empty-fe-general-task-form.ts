import { FeGeneralTaskForm } from "../types/fe-general-task-form";

import { getUpcomingSaturday } from "./get-upcoming-saturday";

export function createEmptyFeGeneralTaskForm(weekEndingDate?: Date | null): FeGeneralTaskForm {
    return {
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
