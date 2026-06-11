import { SaveFeRequisition } from "@/features/fe-requisitions/types/fe-requisition-save.types";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";
import { toDateOnlyString } from "@/lib/format/date";

export function mapFeRequisitionDraftToSaveRequest(draft: FeRequisitionDraft): SaveFeRequisition {
    return {
        rowVersion: draft.rowVersion,
        requisitionDate: toDateOnlyString(draft.requisitionDate) ?? "",
        vanDriverId: draft.vanDriverId ?? "",
        vanDriverName: draft.vanDriverName ?? "",
        shopId: draft.shopId ?? "",

        feGeneralTasks: draft.feGeneralTasks.map((task) => ({
            id: task.id,

            feTaskTypeId: task.taskTypeId ?? "",

            weekEndingDate: toDateOnlyString(task.weekEndingDate) ?? "",

            week: {
                sunday: task.quantities.sunday,
                monday: task.quantities.monday,
                tuesday: task.quantities.tuesday,
                wednesday: task.quantities.wednesday,
                thursday: task.quantities.thursday,
                friday: task.quantities.friday,
                saturday: task.quantities.saturday,
            },

            ratePerJob: task.ratePerJob,
        })),

        feMileages: [],
        feTransfers: [],
        feAdditionalCosts: [],
    };
}
