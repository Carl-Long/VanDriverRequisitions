import { FeGeneralTaskForm } from "../schemas/fe-general-task-form-schema";
import { getUpcomingSaturday } from "./get-upcoming-saturday";

export function createEmptyFeGeneralTaskForm(): FeGeneralTaskForm {
    return {
        weekEndingDate: getUpcomingSaturday(),
        sunday: undefined,
        monday: undefined,
        tuesday: undefined,
        wednesday: undefined,
        thursday: undefined,
        friday: undefined,
        saturday: undefined,
        ratePerJob: undefined,
    };
}