export type FeMileageQuantitiesDraft = {
    sunday: number | null;
    monday: number | null;
    tuesday: number | null;
    wednesday: number | null;
    thursday: number | null;
    friday: number | null;
    saturday: number | null;
};

export type FeMileageDraft = {
    id: string | null;
    clientId: string;
    weekEndingDate: Date | null;
    quantities: FeMileageQuantitiesDraft;
    totalMiles: number;
    ratePerMile: number | null;
    totalValue: number;
};