import { apiFetch } from "@/lib/api/client";

const BASE = "/api/v1/std-locations";

export type StdLocationLookup = {
    id: string;

    shopId: string;
    collectionTypeId: string;

    locationName: string;
    postCode: string;
};

export type StdLocationLookupQuery = {
    shopId: string;
    collectionTypeId: string;
};

const cache = new Map<string, StdLocationLookup[]>();
const pendingRequests = new Map<string, Promise<StdLocationLookup[]>>();

function buildCacheKey(query: StdLocationLookupQuery) {
    return `${query.shopId}:${query.collectionTypeId}`;
}

export const stdLocationsApi = {
    getActiveLookups: (query: StdLocationLookupQuery) => {
        const params = new URLSearchParams();

        params.set("shopId", query.shopId);
        params.set("collectionTypeId", query.collectionTypeId);

        return apiFetch<StdLocationLookup[]>(`${BASE}/lookups?${params}`);
    },

    getCachedActiveLookups: async (query: StdLocationLookupQuery) => {
        const key = buildCacheKey(query);

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