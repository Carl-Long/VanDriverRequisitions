import { VanDriverLookup } from "@/lib/api/van-drivers";

export type FeWeeklyQuantities = {
    sunday?: number;
    monday?: number;
    tuesday?: number;
    wednesday?: number;
    thursday?: number;
    friday?: number;
    saturday?: number;
};

export type FeGeneralTaskDraft = {
    id: string;
    taskTypeId: string;
    taskTypeName: string;
    taskTypeCode: string;
    weekEndingDate: Date;
    week: FeWeeklyQuantities;
    totalNumber: number;
    ratePerJob?: number;
    totalValue?: number;
};



export type FeRequisitionDraft = {
    requisitionDate?: Date;
    vanDriverId: string | null;
    vanDriverLabel: string | null;
    vanDriverSummary: VanDriverLookup | null;
    vanDriverName: string;
    shopId: string | null;
    shopLabel: string | null;
    generalTasks: FeGeneralTaskDraft[];
};