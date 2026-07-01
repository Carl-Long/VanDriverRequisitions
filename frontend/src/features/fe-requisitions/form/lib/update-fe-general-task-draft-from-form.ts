import type { FeGeneralTaskDraft } from "../types/fe-general-task-draft";
import type { FeGeneralTaskForm } from "../types/fe-general-task-form";
import { calculateFeGeneralTaskFormTotals } from "./calculate-fe-general-task-form";

export function updateFeGeneralTaskDraftFromForm(
    row: FeGeneralTaskDraft,
    form: FeGeneralTaskForm,
): FeGeneralTaskDraft {
    const totals = calculateFeGeneralTaskFormTotals(form);

    return {
        ...row,

        weekEndingDate: form.weekEndingDate,

        quantities: {
            ...form.quantities,
        },

        ratePerJob: form.ratePerJob,

        totalNumber: totals.totalJobs,
        totalValue: totals.totalValue,
    };
}