export type SubmitWindow = {
    id: string;
    openFrom: string;
    openTo: string;
    isDeleted: boolean;
    createdAtUtc: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
    deletedAtUtc: string;
    deletedByNameSnapshot: string | null;
};

export type CreateSubmitWindow = {
    openFrom: string;
    openTo: string;
};

export type UpdateSubmitWindow = {
    openFrom: string;
    openTo: string;
};

export type SubmitWindowStatus = {
    currentWindow: SubmitWindow | null;
    nextWindow: SubmitWindow | null;
    hasUpcoming: boolean;
};

export type SubmitWindowFilter =
    | "active"
    | "past"
    | "deleted";
