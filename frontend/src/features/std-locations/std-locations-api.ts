import { apiFetch } from "@/lib/api/client";
import type { PagedResult } from "@/lib/types";
import { StdLocationLookup, StdLocationLookupQuery, StdLocationAdminQuery, StdLocation, CreateStdLocation, UpdateStdLocation } from "./std-location.types";

const BASE = "/api/v1/std-locations";

const cache = new Map<string, StdLocationLookup[]>();
const pendingRequests = new Map<string, Promise<StdLocationLookup[]>>();

function buildLookupCacheKey(query: StdLocationLookupQuery) {
    return `${query.shopId}:${query.collectionTypeId}`;
}

export function buildStdLocationAdminQueryString(query: StdLocationAdminQuery) {
    const params = new URLSearchParams();

    params.set("page", String(query.page ?? 1));
    params.set("pageSize", String(query.pageSize ?? 20));
    params.set("includeInactive", String(query.includeInactive ?? false));

    if (query.search?.trim()) {
        params.set("search", query.search.trim());
    }

    if (query.shopId) {
        params.set("shopId", query.shopId);
    }

    if (query.collectionTypeId) {
        params.set("collectionTypeId", query.collectionTypeId);
    }

    return params.toString();
}

export const stdLocationsApi = {
    getAll: (query: StdLocationAdminQuery) => {
        return apiFetch<PagedResult<StdLocation>>(
            `${BASE}?${buildStdLocationAdminQueryString(query)}`,
        );
    },

    getById: (id: string) => {
        return apiFetch<StdLocation>(`${BASE}/${id}`);
    },

    create: (data: CreateStdLocation) => {
        return apiFetch<StdLocation>(BASE, {
            method: "POST",
            body: data,
        });
    },

    update: (id: string, data: UpdateStdLocation) => {
        return apiFetch<StdLocation>(`${BASE}/${id}`, {
            method: "PUT",
            body: data,
        });
    },

    activate: (id: string) => {
        return apiFetch<void>(`${BASE}/${id}/activate`, {
            method: "POST",
        });
    },

    deactivate: (id: string) => {
        return apiFetch<void>(`${BASE}/${id}/deactivate`, {
            method: "POST",
        });
    },

    getActiveLookups: (query: StdLocationLookupQuery) => {
        const params = new URLSearchParams();

        params.set("shopId", query.shopId);
        params.set("collectionTypeId", query.collectionTypeId);

        return apiFetch<StdLocationLookup[]>(`${BASE}/lookups?${params}`);
    },

    getCachedActiveLookups: async (query: StdLocationLookupQuery) => {
        const key = buildLookupCacheKey(query);

        const cached = cache.get(key);

        if (cached) {
            return cached;
        }

        const pending = pendingRequests.get(key);

        if (pending) {
            return pending;
        }

        const request = stdLocationsApi
            .getActiveLookups(query)
            .then((locations) => {
                cache.set(key, locations);
                return locations;
            })
            .finally(() => {
                pendingRequests.delete(key);
            });

        pendingRequests.set(key, request);

        return request;
    },

    clearCache: () => {
        cache.clear();
        pendingRequests.clear();
    },
};