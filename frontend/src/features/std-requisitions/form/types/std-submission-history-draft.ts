import { StdSubmissionStatus } from "../../std-submissions-view/submission-status";

export type StdSubmissionHistoryDraft = {
    id: string;
    submissionNumber: number;
    status: StdSubmissionStatus;
    submittedByNameSnapshot: string;
    submittedAtUtc: string;
    reviewedByNameSnapshot: string | null;
    reviewedAtUtc: string | null;
    poNumber: string | null;
    rejectionNotes: string | null;
};