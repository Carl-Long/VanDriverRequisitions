import { describe, expect, it } from "vitest";

import { updateFeGeneralTaskDraftFromForm } from "@/features/fe-requisitions/form/lib/update-fe-general-task-draft-from-form";
import type { FeGeneralTaskDraft } from "@/features/fe-requisitions/form/types/fe-general-task-draft";
import type { FeGeneralTaskForm } from "@/features/fe-requisitions/form/types/fe-general-task-form";

describe("updateFeGeneralTaskDraftFromForm", () => {
    it("preserves row identity and task type while updating form fields and recalculating totals", () => {
        const existing: FeGeneralTaskDraft = {
            id: "general-task-id",
            clientId: "general-task-client-id",
            taskTypeId: "task-type-id",
            taskTypeLabel: "Collections",
            weekEndingDate: new Date(2026, 5, 6),
            quantities: {
                sunday: 0,
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
            },
            totalNumber: 0,
            ratePerJob: 1,
            totalValue: 0,
        };

        const form: FeGeneralTaskForm = {
            weekEndingDate: new Date(2026, 5, 13),
            quantities: {
                sunday: 1,
                monday: 2,
                tuesday: null,
                wednesday: 3,
                thursday: 0,
                friday: 4,
                saturday: 5,
            },
            ratePerJob: 2,
        };

        const result = updateFeGeneralTaskDraftFromForm(existing, form);

        expect(result.id).toBe(existing.id);
        expect(result.clientId).toBe(existing.clientId);
        expect(result.taskTypeId).toBe(existing.taskTypeId);
        expect(result.taskTypeLabel).toBe(existing.taskTypeLabel);

        expect(result.weekEndingDate).toBe(form.weekEndingDate);
        expect(result.quantities).toEqual(form.quantities);
        expect(result.ratePerJob).toBe(2);

        expect(result.totalNumber).toBe(15);
        expect(result.totalValue).toBe(30);
    });

    it("treats null quantities and null rate as zero for totals", () => {
        const existing: FeGeneralTaskDraft = {
            id: null,
            clientId: "client-id",
            taskTypeId: "task-type-id",
            taskTypeLabel: "Collections",
            weekEndingDate: null,
            quantities: {
                sunday: 1,
                monday: 1,
                tuesday: 1,
                wednesday: 1,
                thursday: 1,
                friday: 1,
                saturday: 1,
            },
            totalNumber: 7,
            ratePerJob: 10,
            totalValue: 70,
        };

        const form: FeGeneralTaskForm = {
            weekEndingDate: new Date(2026, 5, 13),
            quantities: {
                sunday: null,
                monday: null,
                tuesday: null,
                wednesday: null,
                thursday: null,
                friday: null,
                saturday: null,
            },
            ratePerJob: null,
        };

        const result = updateFeGeneralTaskDraftFromForm(existing, form);

        expect(result.totalNumber).toBe(0);
        expect(result.totalValue).toBe(0);
    });
});