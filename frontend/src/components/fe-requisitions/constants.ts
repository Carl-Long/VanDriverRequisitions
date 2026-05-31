import { FeRequisitionFilters } from "./types";

export const REQUISITION_STATUSES = [
    "Draft",
    "Submitted",
    "Rejected",
    "Resubmitted",
    "SentToFinance",
    "Processed",
    "ReturnedFromFinance",
] as const;

export type RequisitionStatus =
    (typeof REQUISITION_STATUSES)[number];

export const statusVariants = {
    neutral:
        "bg-surface-subtle text-foreground-subtle border border-border",
    info:
        "bg-info-surface text-info border border-info-border",

    warning:
        "bg-warning-surface text-warning border border-warning-border",

    danger:
        "bg-danger-surface text-danger border border-danger-border",

    success:
        "bg-success-surface text-success border border-success-border",

    accent:
        "bg-accent-surface text-accent border border-accent-border",

} as const;

type StatusVariant = keyof typeof statusVariants;

type StatusConfig = {
    label: string;
    variant: StatusVariant;
};

export const requisitionStatusConfig: Record<
    RequisitionStatus,
    StatusConfig
> = {
    Draft: {
        label: "Draft",
        variant: "neutral",
    },

    Submitted: {
        label: "Submitted",
        variant: "info",
    },

    Rejected: {
        label: "Rejected",
        variant: "danger",
    },

    Resubmitted: {
        label: "Resubmitted",
        variant: "warning",
    },

    SentToFinance: {
        label: "Sent to Finance",
        variant: "accent",
    },

    Processed: {
        label: "Processed",
        variant: "success",
    },

    ReturnedFromFinance: {
        label: "Returned",
        variant: "warning",
    },
} as const;

export const INITIAL_FILTERS: FeRequisitionFilters = {
    requisitionNumber: "",
    status: "",
    shopId: null,
    shopLabel: null,
    createdBy: {
        type: "me",
    },
};

export const EMPTY_FILTERS: FeRequisitionFilters =
{
    requisitionNumber: "",
    status: "",
    shopId: null,
    shopLabel: null,
    createdBy: {
        type: "any",
    },
};

export const PAGE_SIZE = 10;