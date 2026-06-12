import { FeTransferDraft } from "../types/fe-transfer-draft";
import { FeTransferForm } from "../types/fe-transfer-form";

export function mapFeTransferDraftToForm(row: FeTransferDraft): FeTransferForm {
    return {
        shopIdFrom: row.shopIdFrom,
        shopLabelFrom: row.shopLabelFrom,

        shopIdTo: row.shopIdTo,
        shopLabelTo: row.shopLabelTo,

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

        ratePerJob: row.ratePerJob,
    };
}