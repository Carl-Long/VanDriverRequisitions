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
};
