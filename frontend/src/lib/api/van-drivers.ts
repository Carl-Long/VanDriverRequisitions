import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";

const BASE = "/api/v1/van-drivers";

export type VanDriverLookup = {
    id: string;
    code: string;
    tradersName: string;
    address1: string;
    address2: string | null;
    town: string | null;
    county: string | null;
    postcode: string;
    phone: string | null;
    hasVat: boolean;
    isActive: boolean;
};

export type VanDriverSearchQuery = {
    search?: string;
    page?: number;
    pageSize?: number;
};

export const vanDriversApi = {
    search: (query: VanDriverSearchQuery = {}) => {
        const params = new URLSearchParams();
        if (query.search) params.set("search", query.search);
        params.set("page", String(query.page ?? 1));
        params.set("pageSize", String(query.pageSize ?? 20));
        return apiFetch<PagedResult<VanDriverLookup>>(`${BASE}?${params}`);
    },
    getById: (id: string) => apiFetch<VanDriverLookup>(`${BASE}/${id}`),
};
