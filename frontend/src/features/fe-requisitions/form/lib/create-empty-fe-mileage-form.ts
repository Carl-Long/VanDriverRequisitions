import { FeMileageForm } from "../types/fe-mileage-form";
import { getUpcomingSaturday } from "./get-upcoming-saturday";

export function createEmptyFeMileageForm(weekEndingDate: Date | null = null): FeMileageForm {
    return {
        weekEndingDate: weekEndingDate ?? getUpcomingSaturday(),
        quantities: {
            sunday: null,
            monday: null,
            tuesday: null,
            wednesday: null,
            thursday: null,
            friday: null,
            saturday: null,
        },
        ratePerMile: null,
    };
}
