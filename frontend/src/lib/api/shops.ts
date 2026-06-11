import { apiFetch } from "@/lib/api/client";

const BASE = "/api/v1/shops";

export type ShopLookup = {
    id: string;
    code: string;
    name: string;
};

let cachedActiveLookups: ShopLookup[] | null = null;
let pendingActiveLookupsRequest: Promise<ShopLookup[]> | null = null;

export const shopsApi = {
    getActiveLookups: () => {
        return apiFetch<ShopLookup[]>(`${BASE}/lookups`);
    },

    getCachedActiveLookups: async () => {
        if (cachedActiveLookups) {
            return cachedActiveLookups;
        }

        if (pendingActiveLookupsRequest) {
            return pendingActiveLookupsRequest;
        }

        pendingActiveLookupsRequest = shopsApi
            .getActiveLookups()
            .then((shops) => {
                cachedActiveLookups = shops;
                return shops;
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