import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";

import { FeGeneralTaskForm } from "../types/fe-general-task-form";

import { calculateFeGeneralTaskFormTotals } from "./calculate-fe-general-task-form";

type Params = {
    taskTypeId: string;

    taskTypeLabel: string;

    form: FeGeneralTaskForm;
};

export function createFeGeneralTaskDraftFromForm({
    taskTypeId,
    taskTypeLabel,
    form,
}: Params): FeGeneralTaskDraft {
    const totals =
        calculateFeGeneralTaskFormTotals(
            form,
        );

    return {
        clientId: crypto.randomUUID(),

        taskTypeId,

        taskTypeLabel,

        weekEndingDate:
            form.weekEndingDate,

        quantities: {
            sunday:
                form.quantities.sunday,

            monday:
                form.quantities.monday,

            tuesday:
                form.quantities.tuesday,

            wednesday:
                form.quantities.wednesday,

            thursday:
                form.quantities.thursday,

            friday:
                form.quantities.friday,

            saturday:
                form.quantities.saturday,
        },

        ratePerJob:
            form.ratePerJob,

        totalNumber:
            totals.totalJobs,

        totalValue:
            totals.totalValue,
    };
}