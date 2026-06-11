import { apiFetch } from "@/lib/api/client";

const BASE = "/api/v1/fe-reasons";

export type FeReason = {
    id: string;
    reason: string;
    isActive: boolean;
    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type CreateFeReason = {
    reason: string;
};

export type UpdateFeReason = {
    reason: string;
};

export const feReasonsApi = {
    getAll: (includeInactive = false) =>
        apiFetch<FeReason[]>(`${BASE}?includeInactive=${includeInactive}`),

    getById: (id: string) => apiFetch<FeReason>(`${BASE}/${id}`),

    create: (data: CreateFeReason) =>
        apiFetch<FeReason>(BASE, {
            method: "POST",
            body: data,
        }),

    update: (id: string, data: UpdateFeReason) =>
        apiFetch<FeReason>(`${BASE}/${id}`, {
            method: "PUT",
            body: data,
        }),

    activate: (id: string) => apiFetch<void>(`${BASE}/${id}/activate`, { method: "POST" }),

    deactivate: (id: string) => apiFetch<void>(`${BASE}/${id}/deactivate`, { method: "POST" }),
};
