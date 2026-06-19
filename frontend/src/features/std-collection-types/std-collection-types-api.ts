import { apiFetch } from "@/lib/api/client";

const BASE = "/api/v1/std-collection-types";

export type StdCollectionTypeLookup = {
    id: string;
    code: string;
    name: string;
};

let cachedActiveLookups: StdCollectionTypeLookup[] | null = null;
let pendingActiveLookupsRequest: Promise<StdCollectionTypeLookup[]> | null = null;

export const stdCollectionTypesApi = {
    getActiveLookups: () => {
        return apiFetch<StdCollectionTypeLookup[]>(`${BASE}/lookups`);
    },

    getCachedActiveLookups: async () => {
        if (cachedActiveLookups) {
            return cachedActiveLookups;
        }

        if (pendingActiveLookupsRequest) {
            return pendingActiveLookupsRequest;
        }

        pendingActiveLookupsRequest = stdCollectionTypesApi
            .getActiveLookups()
            .then((collectionTypes) => {
                cachedActiveLookups = collectionTypes;
                return collectionTypes;
            })
            .finally(() => {
                pendingActiveLookupsRequest = null;
            });

        return pendingActiveLookupsRequest;
    },

    clearCache: () => {
        cachedActiveLookups = null;
        pendingActiveLookupsRequest = null;
    },
};