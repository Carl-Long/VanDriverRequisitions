import { FeRequisitionDraft } from "../types/fe-requisition-draft";

export function createEmptyFeRequisitionDraft(): FeRequisitionDraft {
    return {
        requisitionId: null,
        rowVersion: null,
        requisitionNumber: null,
        status: null,
        requisitionDate: new Date(),
        vanDriverId: null,
        vanDriverLabel: null,
        vanDriverSummary: null,
        vanDriverName: "",
        shopId: null,
        shopLabel: null,
        submittedByNameSnapshot: null,
        submittedAtUtc: null,
        approvedByNameSnapshot: null,
        approvedAtUtc: null,
        poNumber: null,
        rejectedByNameSnapshot: null,
        rejectedAtUtc: null,
        rejectionNotes: null,
        feGeneralTasks: [],
        mileageRows: [],
        transferRows: [],
        additionalCostRows: [],
        submissionHistory: [],

    };
}
