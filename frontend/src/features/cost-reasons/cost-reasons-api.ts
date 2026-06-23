import { apiFetch } from "@/lib/api/client";
import { CostReasonFascia, CostReasonLookup, CostReason, CreateCostReason, UpdateCostReason } from "./cost-reason.types";

const BASE = "/api/v1/cost-reasons";

const lookupCache: Partial<Record<CostReasonFascia, CostReasonLookup[]>> = {};
const pendingLookupRequests: Partial<Record<CostReasonFascia, Promise<CostReasonLookup[]>>> = {};

async function getCachedLookups(fascia: CostReasonFascia) {
    const cached = lookupCache[fascia];

    if (cached) {
        return cached;
    }

    const pending = pendingLookupRequests[fascia];

    if (pending) {
        return pending;
    }

    const request = apiFetch<CostReasonLookup[]>(`${BASE}/lookups?fascia=${fascia}`)
        .then((reasons) => {
            lookupCache[fascia] = reasons;
            return reasons;
        })
        .finally(() => {
            pendingLookupRequests[fascia] = undefined;
        });

    pendingLookupRequests[fascia] = request;

    return request;
}

export const costReasonsApi = {
    getAll: (includeInactive = false) =>
        apiFetch<CostReason[]>(`${BASE}?includeInactive=${includeInactive}`),

    getById: (id: string) => apiFetch<CostReason>(`${BASE}/${id}`),

    getLookups: (fascia: CostReasonFascia) => getCachedLookups(fascia),

    clearLookupCache: () => {
        lookupCache.Fe = undefined;
        lookupCache.Std = undefined;
        pendingLookupRequests.Fe = undefined;
        pendingLookupRequests.Std = undefined;
    },

    create: (data: CreateCostReason) =>
        apiFetch<CostReason>(BASE, {
            method: "POST",
            body: data,
        }),

    update: (id: string, data: UpdateCostReason) =>
        apiFetch<CostReason>(`${BASE}/${id}`, {
            method: "PUT",
            body: data,
        }),

    activate: (id: string) => apiFetch<void>(`${BASE}/${id}/activate`, { method: "POST" }),
    
    deactivate: (id: string) => apiFetch<void>(`${BASE}/${id}/deactivate`, { method: "POST" }),
};