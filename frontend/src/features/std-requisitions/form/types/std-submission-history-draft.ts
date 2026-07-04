import type { SubmissionStatus } from "@/features/requisitions-shared/constants/submission-status.constants";

export type StdSubmissionHistoryDraft = {
    id: string;
    submissionNumber: number;
    status: SubmissionStatus;
    submittedByNameSnapshot: string;
    submittedAtUtc: string;
    reviewedByNameSnapshot: string | null;
    reviewedAtUtc: string | null;
    poNumber: string | null;
    rejectionNotes: string | null;
};