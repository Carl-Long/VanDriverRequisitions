import type { StdRequisitionTab } from "../types/std-requisition-tab";

export function buildStdRequisitionTabs(
    submissionHistoryCount: number,
): StdRequisitionTab[] {
    const tabs: StdRequisitionTab[] = [
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
            label: "Pickup Collections"
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