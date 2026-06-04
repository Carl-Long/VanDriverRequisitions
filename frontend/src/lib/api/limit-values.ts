import { apiFetch } from "@/lib/api/client";

const BASE = "/api/v1/limit-values";

// Mirrors backend enums (serialised as integers)
export const Fascia = { Fe: 0, Std: 1 } as const;
export type Fascia = (typeof Fascia)[keyof typeof Fascia];

export const LimitationType = { Min: 0, Max: 1 } as const;
export type LimitationType = (typeof LimitationType)[keyof typeof LimitationType];

export const FASCIA_LABELS: Record<Fascia, string> = {
    [Fascia.Fe]: "FE",
    [Fascia.Std]: "STD",
};

export const LIMITATION_TYPE_LABELS: Record<LimitationType, string> = {
    [LimitationType.Min]: "Min",
    [LimitationType.Max]: "Max",
};

export type LimitValue = {
    id: string;
    title: string;
    nameOfValue: string;
    fascia: Fascia | null;
    typeOfLimitation: LimitationType;
    numericalLimit: number | null;
    currencyLimit: number | null;
    isActive: boolean;
    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type CreateLimitValue = {
    title: string;
    nameOfValue: string;
    fascia: Fascia | null;
    typeOfLimitation: LimitationType;
    numericalLimit: number | null;
    currencyLimit: number | null;
};

export type UpdateLimitValue = CreateLimitValue;

export const limitValuesApi = {
    getAll: (includeInactive = false) =>
        apiFetch<LimitValue[]>(`${BASE}?includeInactive=${includeInactive}`),

    getById: (id: string) => apiFetch<LimitValue>(`${BASE}/${id}`),

    create: (data: CreateLimitValue) =>
        apiFetch<LimitValue>(BASE, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: UpdateLimitValue) =>
        apiFetch<LimitValue>(`${BASE}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    activate: (id: string) =>
        apiFetch<void>(`${BASE}/${id}/activate`, { method: "POST" }),

    deactivate: (id: string) =>
        apiFetch<void>(`${BASE}/${id}/deactivate`, { method: "POST" }),
};

// Well-known NameOfValue constants for global (non-task-type) limits.
// The admin creates LimitValue entries with these exact NameOfValue strings
// and the requisition form looks them up to enforce max constraints.
export const WELL_KNOWN_LIMITS = {
    MILEAGE_DAILY_QTY: "MILEAGE_DAILY_QTY",
    MILEAGE_RATE: "MILEAGE_RATE",
    TRANSFER_DAILY_QTY: "TRANSFER_DAILY_QTY",
    TRANSFER_RATE: "TRANSFER_RATE",
} as const;

/** Helper: build a lookup map of nameOfValue → limit value from an array */
export function buildLimitLookup(limitValues: LimitValue[]): Record<string, LimitValue> {
    const map: Record<string, LimitValue> = {};
    for (const lv of limitValues) {
        map[lv.nameOfValue] = lv;
    }
    return map;
}
