// lib/api/feTaskTypes.ts

import { apiFetch } from "@/lib/api/client";

const BASE = "/api/v1/fe-task-types";

export type FeTaskType = {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type CreateFeTaskType = {
    name: string;
    code: string;
};

export type UpdateFeTaskType = {
    name: string;
    code: string;
};

export const feTaskTypesApi = {
    getAll(includeInactive = false) {
        const params = new URLSearchParams({
            includeInactive: String(includeInactive),
        });

        return apiFetch<FeTaskType[]>(`${BASE}?${params.toString()}`);
    },

    getById(id: string) {
        return apiFetch<FeTaskType>(`${BASE}/${id}`);
    },

    create(data: CreateFeTaskType) {
        return apiFetch<FeTaskType>(BASE, {
            method: "POST",
            body: data,
        });
    },

    update(id: string, data: UpdateFeTaskType) {
        return apiFetch<FeTaskType>(`${BASE}/${id}`, {
            method: "PUT",
            body: data,
        });
    },

    activate(id: string) {
        return apiFetch<void>(`${BASE}/${id}/activate`, {
            method: "POST",
        });
    },

    deactivate(id: string) {
        return apiFetch<void>(`${BASE}/${id}/deactivate`, {
            method: "POST",
        });
    },
};
