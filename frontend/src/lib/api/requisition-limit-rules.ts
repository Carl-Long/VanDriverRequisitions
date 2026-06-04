// lib/api/requisition-limit-rules.ts

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
    categoryId: number;
    feTaskTypeId?: string | null;
    fasciaId: number;
    maxQuantity: number;
    maxRate: number;
};

export type UpdateRequisitionLimitRule = {
    categoryId: number;
    feTaskTypeId?: string | null;
    fasciaId: number;
    maxQuantity: number;
    maxRate: number;
};

export const requisitionLimitRulesApi = {
    getAll() {
        return apiFetch<RequisitionLimitRuleSummary[]>(BASE);
    },

    getById(id: string) {
        return apiFetch<RequisitionLimitRuleSummary>(
            `${BASE}/${id}`,
        );
    },

    create(data: CreateRequisitionLimitRule) {
        return apiFetch<RequisitionLimitRuleSummary>(BASE, {
            method: "POST",
            body: data,
        });
    },

    update(id: string, data: UpdateRequisitionLimitRule) {
        return apiFetch<RequisitionLimitRuleSummary>(
            `${BASE}/${id}`,
            {
                method: "PUT",
                body: data,
            },
        );
    },
};