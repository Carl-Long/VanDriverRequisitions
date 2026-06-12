import { VanDriverLookup } from "@/lib/api/van-drivers";

import { FeGeneralTaskDraft } from "./fe-general-task-draft";
import { FeSubmissionHistoryDraft } from "./fe-submission-history-draft";
import { RequisitionStatus } from "@/features/fe-requisitions/constants/fe-requisition-status.constants";
import { FeMileageDraft } from "./fe-mileage-draft";
import { FeTransferDraft } from "./fe-transfer-draft";

export type FeRequisitionDraft = {
    requisitionId: string | null;
    rowVersion: string | null;
    requisitionNumber: string | null;
    status: RequisitionStatus | null;
    requisitionDate: Date | null;
    vanDriverId: string | null;
    vanDriverLabel: string | null;
    vanDriverSummary: VanDriverLookup | null;
    vanDriverName: string | null;
    shopId: string | null;
    shopLabel: string | null;
    isShopActive: boolean;
    submittedByNameSnapshot: string | null;
    submittedAtUtc: string | null;

    poNumber: string | null;
    approvedByNameSnapshot: string | null;
    approvedAtUtc: string | null;

    rejectionNotes: string | null;
    rejectedByNameSnapshot: string | null;
    rejectedAtUtc: string | null;

    feGeneralTasks: FeGeneralTaskDraft[];
    feMileages: FeMileageDraft[];
    feTransfers: FeTransferDraft[];
    feAdditionalCosts: [];
    submissionHistory: FeSubmissionHistoryDraft[];
};
