import { WeeklyQuantities, ChargingOption } from "./fe-requisition.types";

export type SaveFeRequisition = {
    rowVersion: string | null;
    requisitionDate: string;
    vanDriverId: string;
    vanDriverName: string;
    shopId: string;
    feGeneralTasks: SaveFeGeneralTask[];
    feMileages: SaveFeMileage[];
    feTransfers: SaveFeTransfer[];
    feAdditionalCosts: SaveFeAdditionalCost[];
};

export type SaveFeGeneralTask = {
    id?: string | null;
    feTaskTypeId: string;
    weekEndingDate: string;
    week: WeeklyQuantities;
    ratePerJob: number | null;
};

export type SaveFeMileage = {
    id?: string | null;
    weekEndingDate: string;
    week: WeeklyQuantities;
    ratePerMile: number | null;
};

export type SaveFeTransfer = {
    id?: string | null;
    weekEndingDate: string;
    shopIdFrom: string;
    shopIdTo: string;
    week: WeeklyQuantities;
    ratePerJob: number | null;
};

export type SaveFeAdditionalCost = {
    id?: string | null;
    weekEndingDate: string;
    reasonId: string;
    chargingOption: ChargingOption;
    totalNumber: number | null;
    ratePerJob: number | null;
    miles: number | null;
    ratePerMile: number | null;
};
