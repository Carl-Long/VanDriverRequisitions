import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";
import {
    SubmitWindowFilter,
    SubmitWindow,
    SubmitWindowStatus,
    CreateSubmitWindow,
    UpdateSubmitWindow,
} from "../types/submit-window.types";

const BASE = "/api/v1/submit-windows";

export const submitWindowsApi = {
    getAll: (page = 1, pageSize = 10, filter: SubmitWindowFilter = "active") =>
        apiFetch<PagedResult<SubmitWindow>>(
            `${BASE}?page=${page}&pageSize=${pageSize}&filter=${filter}`,
        ),

    getById: (id: string) => apiFetch<SubmitWindow>(`${BASE}/${id}`),

    getStatus: () => apiFetch<SubmitWindowStatus>(`${BASE}/status`),

    create: (data: CreateSubmitWindow) =>
        apiFetch<SubmitWindow>(BASE, {
            method: "POST",
            body: data,
        }),

    update: (id: string, data: UpdateSubmitWindow) =>
        apiFetch<SubmitWindow>(`${BASE}/${id}`, {
            method: "PUT",
            body: data,
        }),

    delete: (id: string) => apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" }),
};
