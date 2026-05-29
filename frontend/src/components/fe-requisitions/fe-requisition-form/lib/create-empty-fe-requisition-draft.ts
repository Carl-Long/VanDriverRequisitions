import { FeRequisitionDraft } from "../types/fe-requisition-draft";

export function createEmptyFeRequisitionDraft(): FeRequisitionDraft {
    return {
        requisitionId: null,
        requisitionNumber: null,
        status: "Draft",
        requisitionDate: new Date(),
        vanDriverId: null,
        vanDriverLabel: null,
        vanDriverSummary: null,
        vanDriverName: "",
        shopId: null,
        shopLabel: null,
        feGeneralTasks: [],
        mileageRows: [],
        transferRows: [],
        additionalCostRows: [],
    };
}
