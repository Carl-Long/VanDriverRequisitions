import { apiFetch } from "@/lib/api/client";
import { RequisitionFascia } from "@/lib/constants/fascias";

const BASE = "/api/v1/requisition-limit-rules";

export type RequisitionLimitRuleCategory =
    | "GeneralTask"
    | "Mileage"
    | "Transfer"
    | "AdditionalCost"
    | "FlatCharge"
    | "VanPack";

export type RequisitionLimitRuleFascia = RequisitionFascia

export type RequisitionLimitRuleSummary = {
    id: string;
    category: RequisitionLimitRuleCategory;
    categoryName: string;
    feTaskTypeId: string | null;
    feTaskTypeName: string | null;
    fascia: RequisitionLimitRuleFascia;
    fasciaName: string;
    maxQuantity: number;
    maxRate: number;
    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type CreateRequisitionLimitRule = {
    category: RequisitionLimitRuleCategory;
    feTaskTypeId?: string | null;
    fascia: RequisitionLimitRuleFascia;
    maxQuantity: number;
    maxRate: number;
};

export type UpdateRequisitionLimitRule = {
    category: RequisitionLimitRuleCategory;
    feTaskTypeId?: string | null;
    fascia: RequisitionLimitRuleFascia;
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
