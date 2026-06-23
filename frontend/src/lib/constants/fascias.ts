export const FASCIAS = {
    FE: "Fe",
    STD: "Std",
} as const;

export type RequisitionFascia = (typeof FASCIAS)[keyof typeof FASCIAS];

export const REQUISITION_FASCIAS = [
    FASCIAS.FE,
    FASCIAS.STD,
] as const satisfies readonly RequisitionFascia[];

export const FASCIA_OPTIONS = [
    { value: FASCIAS.FE, label: "FE" },
    { value: FASCIAS.STD, label: "STD" },
] as const satisfies ReadonlyArray<{
    value: RequisitionFascia;
    label: string;
}>;