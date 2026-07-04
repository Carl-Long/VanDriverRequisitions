import { StdRequisitionFilters } from "../types/std-requisition-filters.types";

export const STD_REQUISITION_STATUSES = ["Draft", "Submitted", "Rejected", "Approved"] as const;

export type StdRequisitionStatus = (typeof STD_REQUISITION_STATUSES)[number];

export const stdStatusVariants = {
    neutral: "bg-surface-subtle text-foreground-subtle border border-border",
    pending: "bg-info-surface text-info border border-info-border",
    danger: "bg-danger-surface text-danger border border-danger-border",
    success: "bg-success-surface text-success border border-success-border",
} as const;

type StdStatusVariant = keyof typeof stdStatusVariants;

type StdStatusConfig = {
    label: string;
    variant: StdStatusVariant;
};

export const stdRequisitionStatusConfig: Record<StdRequisitionStatus, StdStatusConfig> = {
    Draft: { label: "Draft", variant: "neutral" },
    Submitted: { label: "Submitted", variant: "pending" },
    Rejected: { label: "Rejected", variant: "danger" },
    Approved: { label: "Approved", variant: "success" },
} as const;

export const INITIAL_STD_REQUISITION_FILTERS: StdRequisitionFilters = {
    requisitionNumber: "",
    status: "",
    shopId: null,
    shopLabel: null,
    createdBy: { type: "me" },
};

export const STD_REQUISITION_PAGE_SIZE = 10;

export const STD_REQUISITION_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;