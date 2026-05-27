import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";

const BASE = "/api/v1/users";

export type UserLookup = {
    id: string;
    name: string;
};

export const usersApi = {
    search: (search: string) => {
        const params = new URLSearchParams();
        params.set("search", search);
        params.set("pageSize", "20");

        return apiFetch<PagedResult<UserLookup>>(`${BASE}?${params}`);
    },
};