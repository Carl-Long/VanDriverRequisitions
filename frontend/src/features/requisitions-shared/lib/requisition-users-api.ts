import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";

const BASE = "/api/v1/requisition-users";

export type RequisitionUserLookup = {
    id: string;
    name: string;
};

export type RequisitionUserSearchQuery = {
    search?: string;
    page?: number;
    pageSize?: number;
};

export const requisitionUsersApi = {
    search: (query: RequisitionUserSearchQuery = {}) => {
        const params = new URLSearchParams();

        if (query.search) {
            params.set("search", query.search);
        }

        params.set("page", String(query.page ?? 1));

        params.set("pageSize", String(query.pageSize ?? 20));

        return apiFetch<PagedResult<RequisitionUserLookup>>(`${BASE}?${params}`);
    },
};
