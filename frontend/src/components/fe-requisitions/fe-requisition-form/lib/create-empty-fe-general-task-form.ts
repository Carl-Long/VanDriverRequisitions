import { FeGeneralTaskForm } from "../types/fe-general-task-form";

export function createEmptyFeGeneralTaskForm(): FeGeneralTaskForm {
    return {
        weekEndingDate:
            undefined,

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