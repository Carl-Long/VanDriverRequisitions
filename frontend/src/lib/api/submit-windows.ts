import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";

const BASE = "/api/v1/submit-windows";

export type SubmitWindow = {
    id: string;
    openFrom: string;
    openTo: string;
    isDeleted: boolean;
    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type CreateSubmitWindow = {
    openFrom: string;
    openTo: string;
};

export type UpdateSubmitWindow = {
    openFrom: string;
    openTo: string;
};

export type SubmitWindowStatus = {
    currentWindow: SubmitWindow | null;
    nextWindow: SubmitWindow | null;
    hasUpcoming: boolean;
};

export const submitWindowsApi = {
    getAll: (page = 1, pageSize = 10, includeDeleted = false) =>
        apiFetch<PagedResult<SubmitWindow>>(
            `${BASE}?page=${page}&pageSize=${pageSize}&includeDeleted=${includeDeleted}`,
        ),

    getById: (id: string) => apiFetch<SubmitWindow>(`${BASE}/${id}`),

    getStatus: () => apiFetch<SubmitWindowStatus>(`${BASE}/status`),

    create: (data: CreateSubmitWindow) =>
        apiFetch<SubmitWindow>(BASE, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: UpdateSubmitWindow) =>
        apiFetch<SubmitWindow>(`${BASE}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" }),

    restore: (id: string) =>
        apiFetch<void>(`${BASE}/${id}/restore`, { method: "POST" }),
};
