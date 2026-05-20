import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";

const BASE = "/api/v1/shops";

export type ShopLookup = {
    id: string;
    code: string;
    name: string;
};

export type ShopSearchQuery = {
    search?: string;
    page?: number;
    pageSize?: number;
};

export const shopsApi = {
    search: (query: ShopSearchQuery = {}) => {
        const params = new URLSearchParams();
        if (query.search) params.set("search", query.search);
        params.set("page", String(query.page ?? 1));
        params.set("pageSize", String(query.pageSize ?? 20));
        return apiFetch<PagedResult<ShopLookup>>(`${BASE}?${params}`);
    },
};
