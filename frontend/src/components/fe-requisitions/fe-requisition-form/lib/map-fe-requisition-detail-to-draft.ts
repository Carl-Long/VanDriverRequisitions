import { FeRequisitionDetail } from "@/features/fe-requisitions/api/fe-requisitions-api";
import { RequisitionStatus } from "@/features/fe-requisitions/constants/fe-requisition-status.constants";
import { FeRequisitionDraft } from "../types/fe-requisition-draft";

export function mapFeRequisitionDetailToDraft(
    detail: FeRequisitionDetail,
): FeRequisitionDraft {
    return {
        requisitionId: detail.id,
        rowVersion: detail.rowVersion,
        requisitionNumber: detail.requisitionNumber,
        status: detail.status as RequisitionStatus,
        requisitionDate: new Date(detail.requisitionDate),
        vanDriverId: detail.vanDriverId,
        vanDriverLabel: `${detail.vanDriverSummary.code} - ${detail.vanDriverSummary.tradersName}`,
        vanDriverSummary: detail.vanDriverSummary,
        vanDriverName: detail.vanDriverName,
        shopId: detail.shopId,
        shopLabel: `${detail.shopCode} - ${detail.shopName}`,
        isShopActive: detail.isShopActive,
        submittedByNameSnapshot: detail.submittedByNameSnapshot,
        submittedAtUtc: detail.submittedAtUtc,
        approvedByNameSnapshot: detail.approvedByNameSnapshot,
        approvedAtUtc: detail.approvedAtUtc,
        poNumber: detail.poNumber,
        rejectedByNameSnapshot: detail.rejectedByNameSnapshot,
        rejectedAtUtc: detail.rejectedAtUtc,
        rejectionNotes: detail.rejectionNotes,
        submissionHistory: detail.submissionHistory,

        feGeneralTasks:
            detail.feGeneralTasks.map(
                (task) => ({
                    id: task.id,

                    clientId:
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