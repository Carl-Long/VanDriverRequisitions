import { apiFetch } from "@/lib/api/client";

const BASE = "/api/v1/fe-task-types";

export type FeTaskType = {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    dailyQuantityLimitId: string | null;
    dailyQuantityMax: number | null;
    rateLimitId: string | null;
    rateMax: number | null;
    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type CreateFeTaskType = {
    name: string;
    code: string;
    dailyQuantityLimitId: string | null;
    rateLimitId: string | null;
};

export type UpdateFeTaskType = {
    name: string;
    code: string;
    dailyQuantityLimitId: string | null;
    rateLimitId: string | null;
};

export const feTaskTypesApi = {
    getAll: (includeInactive = false) =>
        apiFetch<FeTaskType[]>(`${BASE}?includeInactive=${includeInactive}`),

    getById: (id: string) => apiFetch<FeTaskType>(`${BASE}/${id}`),

    create: (data: CreateFeTaskType) =>
        apiFetch<FeTaskType>(BASE, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: UpdateFeTaskType) =>
        apiFetch<FeTaskType>(`${BASE}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    activate: (id: string) =>
        apiFetch<void>(`${BASE}/${id}/activate`, { method: "POST" }),

    deactivate: (id: string) =>
        apiFetch<void>(`${BASE}/${id}/deactivate`, { method: "POST" }),
};
