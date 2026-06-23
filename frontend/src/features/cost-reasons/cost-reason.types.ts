export type CostReasonScope = "Fe" | "Std" | "Shared";
export type CostReasonFascia = "Fe" | "Std";

export type CostReason = {
    id: string;
    code: string;
    reason: string;
    scope: CostReasonScope;
    scopeName: string;
    isActive: boolean;
    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type CostReasonLookup = {
    id: string;
    code: string;
    reason: string;
    displayName: string;
};

export type CreateCostReason = {
    code: string;
    reason: string;
    scope: CostReasonScope;
};

export type UpdateCostReason = {
    code: string;
    reason: string;
    scope: CostReasonScope;
};



