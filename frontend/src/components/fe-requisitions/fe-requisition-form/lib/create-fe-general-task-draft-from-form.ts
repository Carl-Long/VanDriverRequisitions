import { calculateFeGeneralTaskFormTotals } from "./calculate-fe-general-task-form";

import { FeGeneralTaskForm } from "../types/fe-general-task-form";

import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";

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
            form.weekEndingDate ?? null,

        quantities: {
            sunday:
                form.sunday ?? null,

            monday:
                form.monday ?? null,

            tuesday:
                form.tuesday ?? null,

            wednesday:
                form.wednesday ?? null,

            thursday:
                form.thursday ?? null,

            friday:
                form.friday ?? null,

            saturday:
                form.saturday ?? null,
        },

        ratePerJob:
            form.ratePerJob ?? null,

        totalNumber:
            totals.totalJobs,

        totalValue:
            totals.totalValue,
    };
}