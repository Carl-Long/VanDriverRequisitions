import { VanDriverLookup } from "@/lib/api/van-drivers";
import { FeGeneralTaskDraft } from "./fe-general-task-draft";

export type FeWeeklyQuantities = {
    sunday?: number;
    monday?: number;
    tuesday?: number;
    wednesday?: number;
    thursday?: number;
    friday?: number;
    saturday?: number;
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