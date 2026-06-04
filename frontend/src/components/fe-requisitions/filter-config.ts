import {
    REQUISITION_STATUSES,
    requisitionStatusConfig,
} from "./constants";

export type FilterFieldName =
    | "shop"
    | "status";

export const filterConfig: Record<FilterFieldName, any> = {
    shop: {
        type: "async-select",
        label: "Shop",
        placeholder: "Search shop...",
    },

    status: {
        type: "select",
        label: "Status",
        placeholder: "All statuses",
        options: [
            { value: "", label: "All statuses" },
            ...REQUISITION_STATUSES.map((s) => ({
                value: s,
                label: requisitionStatusConfig[s].label,
            })),
        ],
    },
};