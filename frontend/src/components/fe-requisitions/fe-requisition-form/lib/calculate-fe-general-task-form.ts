import { FeGeneralTaskForm } from "../types/fe-general-task-form";

export function calculateFeGeneralTaskFormTotals(
    form: FeGeneralTaskForm,
) {
    const totalJobs =
        (form.sunday ?? 0)
        + (form.monday ?? 0)
        + (form.tuesday ?? 0)
        + (form.wednesday ?? 0)
        + (form.thursday ?? 0)
        + (form.friday ?? 0)
        + (form.saturday ?? 0);

    const totalValue =
        totalJobs *
        (form.ratePerJob ?? 0);

    return {
        totalJobs,

        totalValue,
    };
}