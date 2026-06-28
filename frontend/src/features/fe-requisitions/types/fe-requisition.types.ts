import { VanDriverLookup } from "@/lib/api/van-drivers";
import { FeRequisitionSubmissionHistory } from "./fe-requisition-submission.types";

export type FeRequisitionSummary = {
    id: string;
    requisitionNumber: string;
    requisitionDate: string;
    vanDriverCode: string;
    vanDriverName: string;
    tradersName: string;
    shopCode: string;
    shopName: string;
    status: string;
    subtotal: number;
    createdAtUtc: string;
    createdById: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type FeRequisitionQuery = {
    page?: number;
    pageSize?: number;
    requisitionNumber?: string;
    status?: string;
    shopId?: string;
    createdByUserId?: string;
};

export type FeRequisitionDetail = {
    id: string;
    rowVersion: string | null;
    requisitionNumber: string;
    requisitionDate: string;
    vanDriverSummary: VanDriverLookup;
    vanDriverId: string;
    vanDriverCode: string;
    vanDriverName: string;
    tradersName: string;
    shopId: string;
    shopCode: string;
    shopName: string;
    status: string;
    isVatApplicable: boolean;
    subtotal: number;
    isEditable: boolean;
    isShopActive: boolean;
    feGeneralTasks: FeGeneralTask[];
    feMileages: FeMileage[];
    feTransfers: FeTransfer[];
    feAdditionalCosts: FeAdditionalCost[];
    submittedByNameSnapshot: string | null;
    submittedAtUtc: string | null;
    approvedByNameSnapshot: string | null;
    approvedAtUtc: string | null;
    poNumber: string | null;
    rejectedByNameSnapshot: string | null;
    rejectedAtUtc: string | null;
    rejectionNotes: string | null;
    submissionHistory: FeRequisitionSubmissionHistory[];
};

export type WeeklyQuantities = {
    sunday: number | null;
    monday: number | null;
    tuesday: number | null;
    wednesday: number | null;
    thursday: number | null;
    friday: number | null;
    saturday: number | null;
};

export type ChargingOption = "Job" | "Mileage";

export type FeGeneralTask = {
    id: string | null;
    feTaskTypeId: string;
    taskTypeName: string;
    taskTypeCode: string;
    weekEndingDate: string;
    week: WeeklyQuantities;
    ratePerJob: number | null;
    totalNumber: number;
    totalValue: number | null;
};

export type FeMileage = {
    id: string | null;
    weekEndingDate: string;
    week: WeeklyQuantities;
    ratePerMile: number | null;
    totalMiles: number | null;
    totalValue: number | null;
};

export type FeTransfer = {
    id: string | null;
    weekEndingDate: string;

    shopIdFrom: string;
    shopCodeFrom: string;
    shopNameFrom: string;
    isShopFromActive: boolean;

    shopIdTo: string;
    shopCodeTo: string;
    shopNameTo: string;
    isShopToActive: boolean;

    week: WeeklyQuantities;
    ratePerJob: number | null;
    totalNumber: number;
    totalValue: number | null;
};

export type FeAdditionalCost = {
    id: string | null;
    weekEndingDate: string;
    reasonId: string;
    reasonCode: string;
    reasonText: string;
    isReasonActive: boolean;
    chargingOption: ChargingOption;
    totalNumber: number | null;
    ratePerJob: number | null;
    miles: number | null;
    ratePerMile: number | null;
    totalValue: number | null;
};