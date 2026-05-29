import { VanDriverLookup } from "@/lib/api/van-drivers";

import { FeGeneralTaskDraft } from "./fe-general-task-draft";

export type FeRequisitionDraft = {
    requisitionId: string | null;
    requisitionNumber: string | null;
    status: string;
    requisitionDate: Date | null;
    vanDriverId: string | null;
    vanDriverLabel: string | null;
    vanDriverSummary: VanDriverLookup | null;
    vanDriverName: string;
    shopId: string | null;
    shopLabel: string | null;

    feGeneralTasks: FeGeneralTaskDraft[];
    mileageRows: [];
    transferRows: [];
    additionalCostRows: [];
};