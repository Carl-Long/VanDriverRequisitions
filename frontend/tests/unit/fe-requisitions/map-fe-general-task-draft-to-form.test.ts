import { describe, expect, it } from "vitest";

import { mapFeGeneralTaskDraftToForm } from "@/features/fe-requisitions/form/lib/map-fe-general-task-draft-to-form";
import type { FeGeneralTaskDraft } from "@/features/fe-requisitions/form/types/fe-general-task-draft";

describe("mapFeGeneralTaskDraftToForm", () => {
    it("maps general task draft fields to form fields and omits draft-only fields", () => {
        const row: FeGeneralTaskDraft = {
            id: "general-task-id",
            clientId: "general-task-client-id",

            taskTypeId: "task-type-id",
            taskTypeLabel: "2389 - Collections",

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

            totalNumber: 15,
            ratePerJob: 2,
            totalValue: 30,
        };

        const result = mapFeGeneralTaskDraftToForm(row);

        expect(result).toEqual({
            weekEndingDate: row.weekEndingDate,

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
        });
    });

    it("copies quantities rather than reusing the same object reference", () => {
        const row: FeGeneralTaskDraft = {
            id: "general-task-id",
            clientId: "general-task-client-id",

            taskTypeId: "task-type-id",
            taskTypeLabel: "2389 - Collections",

            weekEndingDate: new Date(2026, 5, 14),

            quantities: {
                sunday: 1,
                monday: 2,
                tuesday: 3,
                wednesday: 4,
                thursday: 5,
                friday: 6,
                saturday: 7,
            },

            totalNumber: 28,
            ratePerJob: 2,
            totalValue: 56,
        };

        const result = mapFeGeneralTaskDraftToForm(row);

        expect(result.quantities).toEqual(row.quantities);
        expect(result.quantities).not.toBe(row.quantities);
    });
});