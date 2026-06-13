import { FeMileageDraft } from "../types/fe-mileage-draft";
import { FeMileageForm } from "../types/fe-mileage-form";

export function mapFeMileageDraftToForm(row: FeMileageDraft): FeMileageForm {
    return {
        weekEndingDate: row.weekEndingDate,
        quantities: {
            sunday: row.quantities.sunday,
            monday: row.quantities.monday,
            tuesday: row.quantities.tuesday,
            wednesday: row.quantities.wednesday,
            thursday: row.quantities.thursday,
            friday: row.quantities.friday,
            saturday: row.quantities.saturday,
        },
        ratePerMile: row.ratePerMile,
    };
}