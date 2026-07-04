import type { SubmissionStatus } from "@/features/requisitions-shared/constants/submission-status.constants";

export type FeSubmissionHistoryDraft = {
    id: string;
    submissionNumber: number;
    status: SubmissionStatus;
    submittedByNameSnapshot: string;
    submittedAtUtc: string;
    poNumber: string | null;
    reviewedByNameSnapshot: string | null;
    reviewedAtUtc: string | null;
    rejectionNotes: string | null;
};