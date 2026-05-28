export type WeeklyQuantitiesDraft = {
    sunday: number | null;
    monday: number | null;
    tuesday: number | null;
    wednesday: number | null;
    thursday: number | null;
    friday: number | null;
    saturday: number | null;
};

export type FeGeneralTaskDraft = {
    clientId: string;
    taskTypeId: string | null;
    taskTypeLabel: string | null;
    weekEndingDate: Date | null;
    quantities: WeeklyQuantitiesDraft;
    totalNumber: number;
    ratePerJob: number | null;
    totalValue: number;
};