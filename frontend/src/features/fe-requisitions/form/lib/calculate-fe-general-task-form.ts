import { FeGeneralTaskForm } from "../types/fe-general-task-form";

export function calculateFeGeneralTaskFormTotals(form: FeGeneralTaskForm) {
    const totalJobs =
        (form.quantities.sunday ?? 0) +
        (form.quantities.monday ?? 0) +
        (form.quantities.tuesday ?? 0) +
        (form.quantities.wednesday ?? 0) +
        (form.quantities.thursday ?? 0) +
        (form.quantities.friday ?? 0) +
        (form.quantities.saturday ?? 0);

    const totalValue = totalJobs * (form.ratePerJob ?? 0);

    return {
        totalJobs,

        totalValue,
    };
}
