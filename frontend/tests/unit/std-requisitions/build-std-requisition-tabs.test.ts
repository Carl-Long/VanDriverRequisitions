import { describe, expect, it } from "vitest";

import { buildStdRequisitionTabs } from "@/features/std-requisitions/form/lib/build-std-requisition-tabs";

describe("buildStdRequisitionTabs", () => {
    it("builds the base STD tabs in the expected order", () => {
        const result = buildStdRequisitionTabs(0);

        expect(result).toEqual([
            {
                type: "details",
                key: "details",
                label: "Details",
            },
            {
                type: "banks-and-bins",
                key: "collection-charges-banks-and-bins",
                label: "Banks & Bins Collections",
            },
            {
                type: "van-packs",
                key: "collection-van-packs",
                label: "Van Pack Collections",
            },
            {
                type: "pickups",
                key: "pickups",
                label: "Pickup Collections",
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

    it("appends submission history tab when history exists", () => {
        const result = buildStdRequisitionTabs(2);

        expect(result.at(-1)).toEqual({
            type: "submission-history",
            key: "submission-history",
            label: "Submission History (2)",
        });
    });

    it("does not append submission history tab when there is no history", () => {
        const result = buildStdRequisitionTabs(0);

        expect(result.some((tab) => tab.type === "submission-history")).toBe(false);
    });
});