import { FeGeneralTaskFormDraft } from "../types/fe-general-task-form-draft";

export function createEmptyFeGeneralTaskForm(): FeGeneralTaskFormDraft {
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