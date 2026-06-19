export type StdSubmissionHistoryDraft = {
    id: string;
    submissionNumber: number;
    status: string;
    submittedByNameSnapshot: string;
    submittedAtUtc: string;
    reviewedByNameSnapshot: string | null;
    reviewedAtUtc: string | null;
    poNumber: string | null;
    rejectionNotes: string | null;
};