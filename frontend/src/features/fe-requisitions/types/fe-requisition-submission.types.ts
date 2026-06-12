import { SubmissionStatus } from "../fe-submissions-view/submission-status";
import { WeeklyQuantities } from "./fe-requisition.types";

export type FeRequisitionSubmissionDetail = {
    id: string;
    submissionNumber: number;
    status: SubmissionStatus;
    submittedByName: string;
    submittedAtUtc: string;
    reviewedByName: string | null;
    reviewedAtUtc: string | null;
    rejectionNotes: string | null;
    poNumber: string | null;
    snapshot: FeRequisitionSnapshot;
};

export type ApproveFeRequisitionRequest = {
    rowVersion: string | null;
};

export type RejectFeRequisitionRequest = {
    rowVersion: string | null;
    rejectionNotes: string;
};

export type FeRequisitionSubmissionHistory = {
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

export type FeRequisitionSnapshot = {
    requisitionNumber: string;
    requisitionDate: string;
    vanDriverCode: string;
    vanDriverName: string;
    tradersName: string;
    shopCode: string;
    shopName: string;
    isVatApplicable: boolean;
    subtotal: number;
    generalTasks: FeGeneralTaskSnapshot[];
    mileages: FeMileageSnapshot[];
    transfers: FeTransferSnapshot[];
};

export type FeGeneralTaskSnapshot = {
    taskTypeCode: string;
    taskTypeName: string;
    weekEndingDate: string;
    totalNumber: number;
    ratePerJob: number;
    totalValue: number;
    week: WeeklyQuantities;
};

export type FeMileageSnapshot = {
    weekEndingDate: string;
    totalMiles: number;
    ratePerMile: number;
    totalValue: number;
    week: WeeklyQuantities;
};

export type FeTransferSnapshot = {
    weekEndingDate: string;
    shopIdFrom: string;
    shopCodeFrom: string;
    shopNameFrom: string;
    shopIdTo: string;
    shopCodeTo: string;
    shopNameTo: string;
    totalNumber: number;
    ratePerJob: number | null;
    totalValue: number | null;
    week: WeeklyQuantities;
};
