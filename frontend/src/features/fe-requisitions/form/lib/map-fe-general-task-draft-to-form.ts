import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";
import { FeGeneralTaskForm } from "../types/fe-general-task-form";

export function mapFeGeneralTaskDraftToForm(task: FeGeneralTaskDraft): FeGeneralTaskForm {
    return {
        weekEndingDate: task.weekEndingDate,

        quantities: {
            ...task.quantities,
        },

        ratePerJob: task.ratePerJob,
    };
}
