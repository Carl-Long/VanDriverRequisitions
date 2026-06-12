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

        feMileages: draft.feMileages.map((mileage) => ({
            id: mileage.id,
            weekEndingDate: toDateOnlyString(mileage.weekEndingDate) ?? "",

            week: {
                sunday: mileage.quantities.sunday,
                monday: mileage.quantities.monday,
                tuesday: mileage.quantities.tuesday,
                wednesday: mileage.quantities.wednesday,
                thursday: mileage.quantities.thursday,
                friday: mileage.quantities.friday,
                saturday: mileage.quantities.saturday,
            },

            ratePerMile: mileage.ratePerMile,
        })),

        feTransfers: draft.feTransfers.map((transfer) => ({
            id: transfer.id,

            weekEndingDate: toDateOnlyString(transfer.weekEndingDate) ?? "",

            shopIdFrom: transfer.shopIdFrom ?? "",
            shopIdTo: transfer.shopIdTo ?? "",

            week: {
                sunday: transfer.quantities.sunday,
                monday: transfer.quantities.monday,
                tuesday: transfer.quantities.tuesday,
                wednesday: transfer.quantities.wednesday,
                thursday: transfer.quantities.thursday,
                friday: transfer.quantities.friday,
                saturday: transfer.quantities.saturday,
            },

            ratePerJob: transfer.ratePerJob,
        })),
        
        feAdditionalCosts: [],
    };
}
