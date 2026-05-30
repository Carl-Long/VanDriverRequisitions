import { FeRequisitionDetail } from "@/lib/api/fe-requisitions";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";

export function mapFeRequisitionDetailToDraft(
    detail: FeRequisitionDetail,
): FeRequisitionDraft {
    return {
        requisitionId: detail.id,
        requisitionNumber: detail.requisitionNumber,
        status: detail.status,
        requisitionDate: new Date(detail.requisitionDate),
        vanDriverId: detail.vanDriverId,

        vanDriverLabel:
            `${detail.vanDriverSummary.code} - ${detail.vanDriverSummary.tradersName}`,

        vanDriverSummary:
            detail.vanDriverSummary,

        vanDriverName:
            detail.vanDriverSummary.tradersName,

        shopId:
            detail.shopId,

        shopLabel:
            `${detail.shopCode} - ${detail.shopName}`,

        feGeneralTasks:
            detail.feGeneralTasks.map(
                (task) => ({
                    clientId:
                        task.id ??
                        crypto.randomUUID(),

                    taskTypeId:
                        task.feTaskTypeId,

                    taskTypeLabel:
                        task.taskTypeName,

                    weekEndingDate:
                        new Date(
                            task.weekEndingDate,
                        ),

                    quantities: {
                        sunday:
                            task.week.sunday,

                        monday:
                            task.week.monday,

                        tuesday:
                            task.week.tuesday,

                        wednesday:
                            task.week.wednesday,

                        thursday:
                            task.week.thursday,

                        friday:
                            task.week.friday,

                        saturday:
                            task.week.saturday,
                    },

                    totalNumber:
                        task.totalNumber,

                    ratePerJob:
                        task.ratePerJob,

                    totalValue:
                        task.totalValue ?? 0,
                }),
            ),

        mileageRows: [],
        transferRows: [],
        additionalCostRows: [],
    };
}