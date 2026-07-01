import { toRequiredDateOnlyString } from "@/lib/format/date";
import { SaveFeRequisition } from "@/features/fe-requisitions/types/fe-requisition-save.types";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";

export function mapFeRequisitionDraftToSaveRequest(draft: FeRequisitionDraft): SaveFeRequisition {
    if (!draft.requisitionDate) {
        throw new Error("Requisition date is required.");
    }

    if (!draft.vanDriverId) {
        throw new Error("Van driver is required.");
    }

    if (!draft.shopId) {
        throw new Error("Shop is required.");
    }

    return {
        rowVersion: draft.rowVersion,
        requisitionDate: toRequiredDateOnlyString(
            draft.requisitionDate,
            "Requisition date is required.",
        ),
        vanDriverId: draft.vanDriverId,
        vanDriverName: draft.vanDriverName?.trim() ?? "",
        shopId: draft.shopId,

        feGeneralTasks: draft.feGeneralTasks.map((task) => {
            if (!task.taskTypeId) {
                throw new Error("General task type is required.");
            }

            if (!task.weekEndingDate) {
                throw new Error("General task week ending date is required.");
            }

            return {
                id: task.id,
                feTaskTypeId: task.taskTypeId,
                weekEndingDate: toRequiredDateOnlyString(
                    task.weekEndingDate,
                    "General task week ending date is required.",
                ),

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
            };
        }),

        feMileages: draft.feMileages.map((mileage) => {
            if (!mileage.weekEndingDate) {
                throw new Error("Mileage week ending date is required.");
            }

            return {
                id: mileage.id,
                weekEndingDate: toRequiredDateOnlyString(
                    mileage.weekEndingDate,
                    "Mileage week ending date is required.",
                ),

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
            };
        }),

        feTransfers: draft.feTransfers.map((transfer) => {
            if (!transfer.weekEndingDate) {
                throw new Error("Transfer week ending date is required.");
            }

            if (!transfer.shopIdFrom) {
                throw new Error("Transfer from shop is required.");
            }

            if (!transfer.shopIdTo) {
                throw new Error("Transfer to shop is required.");
            }

            return {
                id: transfer.id,

                weekEndingDate: toRequiredDateOnlyString(
                    transfer.weekEndingDate,
                    "Transfer week ending date is required.",
                ),

                shopIdFrom: transfer.shopIdFrom,
                shopIdTo: transfer.shopIdTo,

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
            };
        }),

        feAdditionalCosts: draft.feAdditionalCosts.map((cost) => {
            if (!cost.weekEndingDate) {
                throw new Error("Additional cost week ending date is required.");
            }

            if (!cost.reasonId) {
                throw new Error("Additional cost reason is required.");
            }

            return {
                id: cost.id,

                weekEndingDate: toRequiredDateOnlyString(
                    cost.weekEndingDate,
                    "Additional cost week ending date is required.",
                ),

                reasonId: cost.reasonId,

                chargingOption: cost.chargingOption,

                totalNumber: cost.chargingOption === "Job" ? cost.totalNumber : null,
                ratePerJob: cost.chargingOption === "Job" ? cost.ratePerJob : null,

                miles: cost.chargingOption === "Mileage" ? cost.miles : null,
                ratePerMile: cost.chargingOption === "Mileage" ? cost.ratePerMile : null,
            };
        }),
    };
}