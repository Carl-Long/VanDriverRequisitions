import { SubmissionStatus } from "../../fe-submissions-view/submission-status";

export type FeSubmissionHistoryDraft = {
    id: string;
    submissionNumber: number;
    status: SubmissionStatus;
    submittedByNameSnapshot: string;
    submittedAtUtc: string;
    reviewedByNameSnapshot: string | null;
    reviewedAtUtc: string | null;
    rejectionNotes: string | null;
};