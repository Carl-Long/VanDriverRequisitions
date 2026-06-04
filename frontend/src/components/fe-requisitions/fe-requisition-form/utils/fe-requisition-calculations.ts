import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";

export function calculateGeneralTasksSubtotal( tasks: FeGeneralTaskDraft[], ): number {
    return tasks.reduce(
        (sum, task) => sum + (task.totalValue ?? 0),
        0,
    );
}