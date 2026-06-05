import { statusVariants } from "../constants";

export const SUBMISSION_STATUSES = [
    "Pending",
    "Approved",
    "Rejected",
] as const;

export type SubmissionStatus =
    (typeof SUBMISSION_STATUSES)[number];

type SubmissionStatusConfig = {
    label: string;
    variant: keyof typeof statusVariants;
};

export const submissionStatusConfig: Record<
    SubmissionStatus,
    SubmissionStatusConfig
> = {
    Pending: {
        label: "Pending",
        variant: "pending",
    },

    Approved: {
        label: "Approved",
        variant: "success",
    },

    Rejected: {
        label: "Rejected",
        variant: "danger",
    },
};