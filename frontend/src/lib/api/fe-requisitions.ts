import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";

const BASE = "/api/v1/fe-requisitions";

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
};

export type FeRequisitionQuery = {
    page?: number;
    pageSize?: number;
    requisitionNumber?: string;
    status?: string;
    shopId?: string;
    createdByMe?: boolean;
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
    shopIdTo: string;
    shopCodeTo: string;
    shopNameTo: string;
    week: WeeklyQuantities;
    ratePerJob: number | null;
    totalNumber: number;
    totalValue: number | null;
};

export type FeAdditionalCost = {
    id: string | null;
    weekEndingDate: string;
    reasonId: string;
    reasonText: string;
    chargingOption: ChargingOption;
    totalNumber: number | null;
    ratePerJob: number | null;
    miles: number | null;
    ratePerMile: number | null;
    totalValue: number | null;
};

export type FeRequisitionDetail = {
    id: string;
    requisitionNumber: string;
    requisitionDate: string;
    vanDriverId: string;
    vanDriverCode: string;
    vanDriverName: string;
    tradersName: string;
    shopId: string;
    shopCode: string;
    shopName: string;
    status: string;
    isVatApplicable: boolean;
    poNumber: string | null;
    rejectionNotes: string | null;
    subtotal: number;
    isEditable: boolean;
    isVanDriverActive: boolean;
    isShopActive: boolean;
    feGeneralTasks: FeGeneralTask[];
    feMileages: FeMileage[];
    feTransfers: FeTransfer[];
    feAdditionalCosts: FeAdditionalCost[];
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

export type SaveFeRequisition = {
    requisitionDate: string;
    vanDriverId: string;
    vanDriverName: string;
    shopId: string;
    isVatApplicable: boolean;
    poNumber: string | null;
    feGeneralTasks: SaveFeGeneralTask[];
    feMileages: SaveFeMileage[];
    feTransfers: SaveFeTransfer[];
    feAdditionalCosts: SaveFeAdditionalCost[];
};

export const feRequisitionsApi = {
    getAll: (query: FeRequisitionQuery = {}) => {
        const params = new URLSearchParams();
        params.set("page", String(query.page ?? 1));
        params.set("pageSize", String(query.pageSize ?? 10));
        if (query.requisitionNumber) params.set("requisitionNumber", query.requisitionNumber);
        if (query.status) params.set("status", query.status);
        if (query.shopId) params.set("shopId", query.shopId);
        if (query.createdByMe) params.set("createdByMe", "true");
        return apiFetch<PagedResult<FeRequisitionSummary>>(`${BASE}?${params}`);
    },
    getById: (id: string) => apiFetch<FeRequisitionDetail>(`${BASE}/${id}`),
    create: (data: SaveFeRequisition) =>
        apiFetch<FeRequisitionDetail>(BASE, {
            method: "POST",
            body: JSON.stringify(data),
        }),
    update: (id: string, data: SaveFeRequisition) =>
        apiFetch<FeRequisitionDetail>(`${BASE}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    submit: (id: string) =>
        apiFetch<FeRequisitionDetail>(`${BASE}/${id}/submit`, { method: "POST" }),
};
