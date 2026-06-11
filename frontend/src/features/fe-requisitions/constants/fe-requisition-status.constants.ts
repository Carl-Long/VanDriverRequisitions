import { FeRequisitionFilters } from "../types/fe-requisiton-filters.types";

export const REQUISITION_STATUSES = ["Draft", "Submitted", "Rejected", "Approved"] as const;

export type RequisitionStatus = (typeof REQUISITION_STATUSES)[number];

export const statusVariants = {
    neutral: "bg-surface-subtle text-foreground-subtle border border-border",

    pending: "bg-info-surface text-info border border-info-border",

    warning: "bg-warning-surface text-warning border border-warning-border",

    danger: "bg-danger-surface text-danger border border-danger-border",

    success: "bg-success-surface text-success border border-success-border",

    accent: "bg-accent-surface text-accent border border-accent-border",
} as const;

type StatusVariant = keyof typeof statusVariants;

type StatusConfig = {
    label: string;
    variant: StatusVariant;
};

export const requisitionStatusConfig: Record<RequisitionStatus, StatusConfig> = {
    Draft: { label: "Draft", variant: "neutral" },
    Submitted: { label: "Submitted", variant: "pending" },
    Rejected: { label: "Rejected", variant: "danger" },
    Approved: { label: "Approved", variant: "success" },
} as const;

export const INITIAL_FILTERS: FeRequisitionFilters = {
    requisitionNumber: "",
    status: "",
    shopId: null,
    shopLabel: null,
    createdBy: { type: "me" },
};

export const PAGE_SIZE = 10;
