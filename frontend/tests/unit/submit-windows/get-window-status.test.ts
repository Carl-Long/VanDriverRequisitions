import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { getWindowStatus } from "@/features/submit-windows/utils/get-window-status";
import type { SubmitWindow } from "@/features/submit-windows/types/submit-window.types";

function createSubmitWindow(
    overrides: Partial<SubmitWindow> = {},
): SubmitWindow {
    return {
        id: "submit-window-id",
        openFrom: "2026-07-03T11:00:00.000Z",
        openTo: "2026-07-03T13:00:00.000Z",
        isDeleted: false,
        createdAtUtc: "2026-07-01T09:00:00.000Z",
        createdByNameSnapshot: "Created By",
        updatedAtUtc: null,
        updatedByNameSnapshot: null,
        deletedAtUtc: "",
        deletedByNameSnapshot: null,
        ...overrides,
    };
}

describe("getWindowStatus", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-07-03T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns deleted when the window is deleted, regardless of dates", () => {
        const result = getWindowStatus(
            createSubmitWindow({
                isDeleted: true,
                openFrom: "2026-07-04T11:00:00.000Z",
                openTo: "2026-07-04T13:00:00.000Z",
                deletedAtUtc: "2026-07-03T10:00:00.000Z",
                deletedByNameSnapshot: "Deleted By",
            }),
        );

        expect(result).toBe("deleted");
    });

    it("returns upcoming when now is before the open-from date", () => {
        const result = getWindowStatus(
            createSubmitWindow({
                openFrom: "2026-07-03T12:01:00.000Z",
                openTo: "2026-07-03T13:00:00.000Z",
            }),
        );

        expect(result).toBe("upcoming");
    });

    it("returns open when now is exactly the open-from date", () => {
        const result = getWindowStatus(
            createSubmitWindow({
                openFrom: "2026-07-03T12:00:00.000Z",
                openTo: "2026-07-03T13:00:00.000Z",
            }),
        );

        expect(result).toBe("open");
    });

    it("returns open when now is between the open-from and open-to dates", () => {
        const result = getWindowStatus(
            createSubmitWindow({
                openFrom: "2026-07-03T11:00:00.000Z",
                openTo: "2026-07-03T13:00:00.000Z",
            }),
        );

        expect(result).toBe("open");
    });

    it("returns open when now is exactly the open-to date", () => {
        const result = getWindowStatus(
            createSubmitWindow({
                openFrom: "2026-07-03T11:00:00.000Z",
                openTo: "2026-07-03T12:00:00.000Z",
            }),
        );

        expect(result).toBe("open");
    });

    it("returns closed when now is after the open-to date", () => {
        const result = getWindowStatus(
            createSubmitWindow({
                openFrom: "2026-07-03T10:00:00.000Z",
                openTo: "2026-07-03T11:59:59.000Z",
            }),
        );

        expect(result).toBe("closed");
    });
});