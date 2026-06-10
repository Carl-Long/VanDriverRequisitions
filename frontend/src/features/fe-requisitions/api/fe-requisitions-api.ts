import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";
import { SaveFeRequisition } from "../types/fe-requisition-save.types";
import { FeRequisitionSubmissionDetail, ApproveFeRequisitionRequest, RejectFeRequisitionRequest } from "../types/fe-requisition-submission.types";
import { FeRequisitionQuery, FeRequisitionSummary, FeRequisitionDetail } from "../types/fe-requisition.types";

const BASE = "/api/v1/fe-requisitions";

export const feRequisitionsApi = {
    getAll: (query: FeRequisitionQuery = {}) => {
        const params = new URLSearchParams();
        params.set("page", String(query.page ?? 1));
        params.set("pageSize", String(query.pageSize ?? 10));
        if (query.requisitionNumber) params.set("requisitionNumber", query.requisitionNumber);
        if (query.status) params.set("status", query.status);
        if (query.shopId) params.set("shopId", query.shopId);
        if (query.createdByUserId) { params.set("createdByUserId", query.createdByUserId); }
        return apiFetch<PagedResult<FeRequisitionSummary>>(`${BASE}?${params}`);
    },
    getById: (id: string) => apiFetch<FeRequisitionDetail>(`${BASE}/${id}`),

    create: (data: SaveFeRequisition) =>
        apiFetch<FeRequisitionDetail>(BASE, {
            method: "POST",
            body: data,
        }),

    update: (id: string, data: SaveFeRequisition) =>
        apiFetch<FeRequisitionDetail>(`${BASE}/${id}`, {
            method: "PUT",
            body: data,
        }),

    submitNew: (data: SaveFeRequisition) =>
        apiFetch<FeRequisitionDetail>(
            `${BASE}/submit`,
            {
                method: "POST",
                body: data,
            },
        ),

    submitExisting: (id: string, data: SaveFeRequisition) =>
        apiFetch<FeRequisitionDetail>(
            `${BASE}/${id}/submit`,
            {
                method: "POST",
                body: data,
            },
        ),

    getSubmission: (submissionId: string) =>
        apiFetch<FeRequisitionSubmissionDetail>(`${BASE}/submissions/${submissionId}`,),

    approve: (id: string, data: ApproveFeRequisitionRequest) =>
        apiFetch<FeRequisitionDetail>(
            `${BASE}/${id}/approve`,
            {
                method: "POST",
                body: data,
            },
        ),

    reject: (id: string, data: RejectFeRequisitionRequest) =>
        apiFetch<FeRequisitionDetail>(
            `${BASE}/${id}/reject`,
            {
                method: "POST",
                body: data,
            },
        ),
};
