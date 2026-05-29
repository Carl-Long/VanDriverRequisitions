import {
    SaveFeRequisition,
} from "@/lib/api/fe-requisitions";

import { FeRequisitionDraft } from "../types/fe-requisition-draft";

export function mapFeRequisitionDraftToSaveRequest(
    draft: FeRequisitionDraft,
): SaveFeRequisition {
    return {
        requisitionDate:
            draft.requisitionDate
                ?.toISOString()
                .split("T")[0] ?? "",

        vanDriverId:
            draft.vanDriverId ?? "",

        vanDriverName:
            draft.vanDriverName,

        shopId:
            draft.shopId ?? "",

        feGeneralTasks:
            draft.feGeneralTasks.map((task) => ({
                feTaskTypeId:
                    task.taskTypeId ?? "",

                weekEndingDate:
                    task.weekEndingDate
                        ?.toISOString()
                        .split("T")[0] ?? "",
                        
                week: {
                    sunday:
                        task.quantities.sunday,

                    monday:
                        task.quantities.monday,

                    tuesday:
                        task.quantities.tuesday,

                    wednesday:
                        task.quantities.wednesday,

                    thursday:
                        task.quantities.thursday,

                    friday:
                        task.quantities.friday,

                    saturday:
                        task.quantities.saturday,
                },

                ratePerJob:
                    task.ratePerJob,
            })),

        feMileages: [],

        feTransfers: [],

        feAdditionalCosts: [],
    };
}

