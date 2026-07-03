import { describe, expect, it } from "vitest";

import { resolveSelectedLookupActiveState } from "@/features/requisitions-shared/lib/resolve-selected-lookup-active-state";

describe("resolveSelectedLookupActiveState", () => {
    it("returns true when no next lookup is selected", () => {
        const result = resolveSelectedLookupActiveState({
            previousId: "previous-id",
            previousIsActive: false,
            nextId: null,
        });

        expect(result).toBe(true);
    });

    it("preserves inactive state when the same inactive lookup remains selected", () => {
        const result = resolveSelectedLookupActiveState({
            previousId: "lookup-id",
            previousIsActive: false,
            nextId: "lookup-id",
        });

        expect(result).toBe(false);
    });

    it("returns true when a different lookup is selected", () => {
        const result = resolveSelectedLookupActiveState({
            previousId: "old-lookup-id",
            previousIsActive: false,
            nextId: "new-lookup-id",
        });

        expect(result).toBe(true);
    });

    it("returns true when the previous lookup was active", () => {
        const result = resolveSelectedLookupActiveState({
            previousId: "lookup-id",
            previousIsActive: true,
            nextId: "lookup-id",
        });

        expect(result).toBe(true);
    });
});