import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";
import { SaveStdRequisition } from "../types/std-requisition-save.types";
import {
    ApproveStdRequisitionRequest,
    RejectStdRequisitionRequest,
    StdRequisitionSubmissionDetail,
} from "../types/std-requisition-submission.types";
import {
    StdRequisitionDetail,
    StdRequisitionQuery,
    StdRequisitionSummary,
} from "../types/std-requisition.types";

const BASE = "/api/v1/std-requisitions";

export const stdRequisitionsApi = {
    getAll: (query: StdRequisitionQuery = {}) => {
        const params = new URLSearchParams();

        params.set("page", String(query.page ?? 1));
        params.set("pageSize", String(query.pageSize ?? 10));

        if (query.requisitionNumber) {
            params.set("requisitionNumber", query.requisitionNumber);
        }

        if (query.status) {
            params.set("status", query.status);
        }

        if (query.shopId) {
            params.set("shopId", query.shopId);
        }

        if (query.createdByUserId) {
            params.set("createdByUserId", query.createdByUserId);
        }

        return apiFetch<PagedResult<StdRequisitionSummary>>(`${BASE}?${params}`);
    },

    getById: (id: string) => apiFetch<StdRequisitionDetail>(`${BASE}/${id}`),

    create: (data: SaveStdRequisition) =>
        apiFetch<StdRequisitionDetail>(BASE, {
            method: "POST",
            body: data,
        }),

    update: (id: string, data: SaveStdRequisition) =>
        apiFetch<StdRequisitionDetail>(`${BASE}/${id}`, {
            method: "PUT",
            body: data,
        }),

    submitNew: (data: SaveStdRequisition) =>
        apiFetch<StdRequisitionDetail>(`${BASE}/submit`, {
            method: "POST",
            body: data,
        }),

    submitExisting: (id: string, data: SaveStdRequisition) =>
        apiFetch<StdRequisitionDetail>(`${BASE}/${id}/submit`, {
            method: "POST",
            body: data,
        }),

    getSubmission: (submissionId: string) =>
        apiFetch<StdRequisitionSubmissionDetail>(`${BASE}/submissions/${submissionId}`),

    approve: (id: string, data: ApproveStdRequisitionRequest) =>
        apiFetch<StdRequisitionDetail>(`${BASE}/${id}/approve`, {
            method: "POST",
            body: data,
        }),

    reject: (id: string, data: RejectStdRequisitionRequest) =>
        apiFetch<StdRequisitionDetail>(`${BASE}/${id}/reject`, {
            method: "POST",
            body: data,
        }),
};