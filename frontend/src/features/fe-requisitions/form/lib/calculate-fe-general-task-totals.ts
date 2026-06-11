import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";
import { FeGeneralTaskTotals } from "../types/fe-general-task-totals";

export function calculateFeGeneralTaskTotals(tasks: FeGeneralTaskDraft[]): FeGeneralTaskTotals {
    return tasks.reduce<FeGeneralTaskTotals>(
        (acc, task) => {
            acc.sunday += task.quantities.sunday ?? 0;

            acc.monday += task.quantities.monday ?? 0;

            acc.tuesday += task.quantities.tuesday ?? 0;

            acc.wednesday += task.quantities.wednesday ?? 0;

            acc.thursday += task.quantities.thursday ?? 0;

            acc.friday += task.quantities.friday ?? 0;

            acc.saturday += task.quantities.saturday ?? 0;

            acc.totalJobs += task.totalNumber;

            acc.subtotal += task.totalValue;

            return acc;
        },

        {
            sunday: 0,
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            totalJobs: 0,
            subtotal: 0,
        },
    );
}
