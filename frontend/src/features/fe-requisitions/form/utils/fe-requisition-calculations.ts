import { FeAdditionalCostDraft } from "../types/fe-additional-cost-draft";
import { FeGeneralTaskDraft } from "../types/fe-general-task-draft";
import { FeMileageDraft } from "../types/fe-mileage-draft";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";
import { FeTransferDraft } from "../types/fe-transfer-draft";

export function calculateGeneralTasksSubtotal(tasks: FeGeneralTaskDraft[]): number {
    return tasks.reduce((sum, task) => sum + (task.totalValue ?? 0), 0);
}

export function calculateMileageSubtotal(tasks: FeMileageDraft[]): number {
    return tasks.reduce((sum, task) => sum + (task.totalValue ?? 0), 0);
}

export function calculateTransfersSubtotal(tasks: FeTransferDraft[]): number {
    return tasks.reduce((sum, task) => sum + (task.totalValue ?? 0), 0);
}

export function calculateAdditionalCostsSubtotal(tasks: FeAdditionalCostDraft[]): number {
    return tasks.reduce((sum, task) => sum + (task.totalValue ?? 0), 0);
}

export function calculateFeRequisitionSubtotal(draft: FeRequisitionDraft) {
    return (
        calculateGeneralTasksSubtotal(draft.feGeneralTasks) +
        calculateMileageSubtotal(draft.feMileages) +
        calculateTransfersSubtotal(draft.feTransfers) + 
        calculateAdditionalCostsSubtotal(draft.feAdditionalCosts)
    );
}