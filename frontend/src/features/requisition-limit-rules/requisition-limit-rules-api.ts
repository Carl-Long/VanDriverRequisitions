import { apiFetch } from "@/lib/api/client";

const BASE = "/api/v1/requisition-limit-rules";

export type RequisitionLimitRuleSummary = {
    id: string;
    categoryId: number;
    categoryName: string;
    feTaskTypeId: string | null;
    feTaskTypeName: string | null;
    fasciaId: number;
    fasciaName: string;
    maxQuantity: number;
    maxRate: number;
    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type CreateRequisitionLimitRule = {
    category: number;
    feTaskTypeId?: string | null;
    fascia: number;
    maxQuantity: number;
    maxRate: number;
};

export type UpdateRequisitionLimitRule = {
    category: number;
    feTaskTypeId?: string | null;
    fascia: number;
    maxQuantity: number;
    maxRate: number;
};

export const requisitionLimitRulesApi = {
    getAll() {
        return apiFetch<RequisitionLimitRuleSummary[]>(BASE);
    },

    getById(id: string) {
        return apiFetch<RequisitionLimitRuleSummary>(`${BASE}/${id}`);
    },

    create(data: CreateRequisitionLimitRule) {
        return apiFetch<RequisitionLimitRuleSummary>(BASE, {
            method: "POST",
            body: data,
        });
    },

    update(id: string, data: UpdateRequisitionLimitRule) {
        return apiFetch<RequisitionLimitRuleSummary>(`${BASE}/${id}`, {
            method: "PUT",
            body: data,
        });
    },
};
