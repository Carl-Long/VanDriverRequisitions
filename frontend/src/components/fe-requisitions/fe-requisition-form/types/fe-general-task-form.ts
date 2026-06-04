export type WeeklyQuantitiesForm = {
    sunday: number | null;
    monday: number | null;
    tuesday: number | null;
    wednesday: number | null;
    thursday: number | null;
    friday: number | null;
    saturday: number | null;
};

export type FeGeneralTaskForm = {
    weekEndingDate: Date | null;
    quantities: WeeklyQuantitiesForm;
    ratePerJob: number | null;
};