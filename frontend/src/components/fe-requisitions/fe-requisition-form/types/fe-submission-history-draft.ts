export type FeSubmissionHistoryDraft = {
    id: string;
    submissionNumber: number;
    status: string;
    submittedByNameSnapshot: string;
    submittedAtUtc: string;
    reviewedByNameSnapshot: string | null;
    reviewedAtUtc: string | null;
    rejectionNotes: string | null;
};