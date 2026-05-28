import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";

export function createEmptyFeGeneralTask(): FeGeneralTaskDraft {
    return {
        clientId: crypto.randomUUID(),
        taskTypeId: null,
        taskTypeLabel: null,
        weekEndingDate: null,

        quantities: {
            sunday: null,
            monday: null,
            tuesday: null,
            wednesday: null,
            thursday: null,
            friday: null,
            saturday: null,
        },
        totalNumber: 0,
        ratePerJob: null,
        totalValue: 0,
    };
}