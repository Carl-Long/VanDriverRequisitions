import { afterEach, describe, expect, it, vi } from "vitest";

import { createFeGeneralTaskDraftFromForm } from "@/features/fe-requisitions/form/lib/create-fe-general-task-draft-from-form";
import type { FeGeneralTaskForm } from "@/features/fe-requisitions/form/types/fe-general-task-form";

describe("createFeGeneralTaskDraftFromForm", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("creates a new general task draft row with calculated totals", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000101",
        );

        const form: FeGeneralTaskForm = {
            weekEndingDate: new Date(2026, 5, 14),
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

        const result = createFeGeneralTaskDraftFromForm({
            taskTypeId: "task-type-id",
            taskTypeLabel: "2389 - Collections",
            form,
        });

        expect(result).toEqual({
            id: null,
            clientId: "00000000-0000-4000-8000-000000000101",

            taskTypeId: "task-type-id",
            taskTypeLabel: "2389 - Collections",

            weekEndingDate: form.weekEndingDate,

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

            totalNumber: 15,
            totalValue: 30,
        });
    });

    it("treats null quantities and null rate as zero for totals", () => {
        vi.spyOn(crypto, "randomUUID").mockReturnValue(
            "00000000-0000-4000-8000-000000000102",
        );

        const form: FeGeneralTaskForm = {
            weekEndingDate: new Date(2026, 5, 14),
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

        const result = createFeGeneralTaskDraftFromForm({
            taskTypeId: "task-type-id",
            taskTypeLabel: "2389 - Collections",
            form,
        });

        expect(result.clientId).toBe("00000000-0000-4000-8000-000000000102");
        expect(result.id).toBeNull();
        expect(result.totalNumber).toBe(0);
        expect(result.totalValue).toBe(0);
    });
});