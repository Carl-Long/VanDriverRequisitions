import { stdStatusVariants } from "../constants/std-requisition-status.constants";

export const STD_SUBMISSION_STATUSES = ["Pending", "Approved", "Rejected"] as const;

export type StdSubmissionStatus = (typeof STD_SUBMISSION_STATUSES)[number];

type SubmissionStatusConfig = {
    label: string;
    variant: keyof typeof stdStatusVariants;
};

export const stdSubmissionStatusConfig: Record<StdSubmissionStatus, SubmissionStatusConfig> = {
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