import { describe, expect, it } from "vitest";

import type { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { buildFeRequisitionTabs } from "@/features/fe-requisitions/form/lib/build-fe-requisition-tabs";

function createTaskType(overrides: Partial<FeTaskType> = {}): FeTaskType {
    return {
        id: "task-type-id",
        name: "Collections",
        code: "2389",
        isActive: true,
        createdAtUtc: "2026-01-01T00:00:00Z",
        createdByNameSnapshot: "Created By",
        updatedAtUtc: null,
        updatedByNameSnapshot: null,
        ...overrides,
    };
}

describe("buildFeRequisitionTabs", () => {
    it("builds the base FE tabs with active task types in order", () => {
        const result = buildFeRequisitionTabs(
            [
                createTaskType({
                    id: "task-type-1",
                    name: "Collections",
                }),
                createTaskType({
                    id: "task-type-2",
                    name: "Deliveries",
                }),
            ],
            new Set(),
            0,
        );

        expect(result).toEqual([
            {
                type: "details",
                key: "details",
                label: "Details",
            },
            {
                type: "general-task",
                key: "task-type-task-type-1",
                taskTypeId: "task-type-1",
                label: "Collections",
                isInactive: false,
            },
            {
                type: "general-task",
                key: "task-type-task-type-2",
                taskTypeId: "task-type-2",
                label: "Deliveries",
                isInactive: false,
            },
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
        ]);
    });

    it("hides inactive unused task types", () => {
        const result = buildFeRequisitionTabs(
            [
                createTaskType({
                    id: "active-task-type-id",
                    name: "Active Task",
                    isActive: true,
                }),
                createTaskType({
                    id: "inactive-unused-task-type-id",
                    name: "Inactive Unused Task",
                    isActive: false,
                }),
            ],
            new Set(),
            0,
        );

        expect(result).toHaveLength(5);
        expect(result.some((tab) => tab.key === "task-type-inactive-unused-task-type-id")).toBe(false);
    });

    it("keeps inactive used task types and marks the label as inactive", () => {
        const result = buildFeRequisitionTabs(
            [
                createTaskType({
                    id: "inactive-used-task-type-id",
                    name: "Inactive Used Task",
                    isActive: false,
                }),
            ],
            new Set(["inactive-used-task-type-id"]),
            0,
        );

        expect(result[1]).toEqual({
            type: "general-task",
            key: "task-type-inactive-used-task-type-id",
            taskTypeId: "inactive-used-task-type-id",
            label: "Inactive Used Task (Inactive)",
            isInactive: true,
        });
    });

    it("appends submission history tab when history exists", () => {
        const result = buildFeRequisitionTabs(
            [],
            new Set(),
            3,
        );

        expect(result.at(-1)).toEqual({
            type: "submission-history",
            key: "submission-history",
            label: "Submission History (3)",
        });
    });

    it("does not append submission history tab when there is no history", () => {
        const result = buildFeRequisitionTabs(
            [],
            new Set(),
            0,
        );

        expect(result.some((tab) => tab.type === "submission-history")).toBe(false);
    });
});