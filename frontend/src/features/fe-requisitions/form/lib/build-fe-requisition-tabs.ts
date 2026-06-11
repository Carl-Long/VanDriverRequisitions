import { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { FeRequisitionTab } from "../types/fe-requisition-tab";

export function buildFeRequisitionTabs(
    taskTypes: FeTaskType[],
    submissionHistoryCount: number,
): FeRequisitionTab[] {
    const tabs: FeRequisitionTab[] = [
        {
            type: "details",
            key: "details",
            label: "Details",
        },

        ...taskTypes.map<FeRequisitionTab>((taskType) => ({
            type: "general-task",
            key: `task-type-${taskType.id}`,
            taskTypeId: taskType.id,
            label: taskType.name,
        })),

        {
            type: "mileage",
            key: "mileage",
            label: "Mileage",
        },

        {
            type: "transfers",
            key: "transfers",
            label: "Transfers",
        },

        {
            type: "additional-costs",
            key: "additional-costs",
            label: "Additional Costs",
        },
    ];

    if (submissionHistoryCount > 0) {
        tabs.push({
            type: "submission-history",
            key: "submission-history",
            label: `Submission History (${submissionHistoryCount})`,
        });
    }

    return tabs;
}
