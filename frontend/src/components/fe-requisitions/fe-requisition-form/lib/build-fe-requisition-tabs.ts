import { FeTaskType } from "@/lib/api/fe-task-types";
import { FeRequisitionTab } from "../types/fe-requisition-tab";

export function buildFeRequisitionTabs(
    taskTypes: FeTaskType[],
): FeRequisitionTab[] {
    return [
        {
            type: "details",
            key: "details",
            label: "Details",
        },

        ...taskTypes.map(
            (taskType) => ({
                type: "general-task" as const,
                key: `task-type-${taskType.id}`,
                taskTypeId: taskType.id,
                label: taskType.name,
            }),
        ),

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
}