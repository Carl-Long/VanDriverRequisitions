import {
    REQUISITION_STATUSES,
    requisitionStatusConfig,
} from "../../constants/fe-requisition-status.constants";

type AsyncSelectFilterConfig = {
    type: "async-select";
    label: string;
    placeholder: string;
};

type SelectFilterConfig = {
    type: "select";
    label: string;
    placeholder: string;
    options: { value: string; label: string }[];
};

export type FilterFieldName = "shop" | "status";

type FilterConfig = {
    shop: AsyncSelectFilterConfig;
    status: SelectFilterConfig;
};

export const filterConfig: FilterConfig = {
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
            ...REQUISITION_STATUSES.map((status) => ({
                value: status,
                label: requisitionStatusConfig[status].label,
            })),
        ],
    },
};