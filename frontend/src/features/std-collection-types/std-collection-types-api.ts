import { apiFetch } from "@/lib/api/client";

const BASE = "/api/v1/std-collection-types";

export type StdCollectionType = {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type StdCollectionTypeLookup = {
    id: string;
    code: string;
    name: string;
};

export type CreateStdCollectionType = {
    code: string;
    name: string;
};

export type UpdateStdCollectionType = {
    code: string;
    name: string;
};

let cachedActiveLookups: StdCollectionTypeLookup[] | null = null;
let pendingActiveLookupsRequest: Promise<StdCollectionTypeLookup[]> | null = null;

export const stdCollectionTypesApi = {
    getAll(includeInactive = false) {
        const params = new URLSearchParams({
            includeInactive: String(includeInactive),
        });

        return apiFetch<StdCollectionType[]>(`${BASE}?${params.toString()}`);
    },

    getById(id: string) {
        return apiFetch<StdCollectionType>(`${BASE}/${id}`);
    },

    getActiveLookups() {
        return apiFetch<StdCollectionTypeLookup[]>(`${BASE}/lookups`);
    },

    async getCachedActiveLookups() {
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

    clearCache() {
        cachedActiveLookups = null;
        pendingActiveLookupsRequest = null;
    },

    create(data: CreateStdCollectionType) {
        return apiFetch<StdCollectionType>(BASE, {
            method: "POST",
            body: data,
        });
    },

    update(id: string, data: UpdateStdCollectionType) {
        return apiFetch<StdCollectionType>(`${BASE}/${id}`, {
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