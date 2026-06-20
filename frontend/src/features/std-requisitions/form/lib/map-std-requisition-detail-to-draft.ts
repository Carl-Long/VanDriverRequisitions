import type { StdRequisitionDetail } from "../../types/std-requisition.types";
import type { StdRequisitionStatus } from "../../constants/std-requisition-status.constants";
import type { StdRequisitionDraft } from "../types/std-requisition-draft";
import { parseDateOnly } from "@/lib/format/date";

export function mapStdRequisitionDetailToDraft(
    requisition: StdRequisitionDetail,
): StdRequisitionDraft {
    return {
        requisitionId: requisition.id,
        rowVersion: requisition.rowVersion,
        requisitionNumber: requisition.requisitionNumber,
        status: requisition.status as StdRequisitionStatus,

        requisitionDate: parseDateOnly(requisition.requisitionDate),

        vanDriverId: requisition.vanDriverId,
        vanDriverLabel: `${requisition.vanDriverSummary.code} - ${requisition.vanDriverSummary.tradersName}`,
        vanDriverSummary: requisition.vanDriverSummary,
        vanDriverName: requisition.vanDriverName,

        shopId: requisition.shopId,
        shopLabel: `${requisition.shopCode} - ${requisition.shopName}`,
        isShopActive: requisition.isShopActive,

        submittedByNameSnapshot: requisition.submittedByNameSnapshot,
        submittedAtUtc: requisition.submittedAtUtc,

        poNumber: requisition.poNumber,
        approvedByNameSnapshot: requisition.approvedByNameSnapshot,
        approvedAtUtc: requisition.approvedAtUtc,

        rejectionNotes: requisition.rejectionNotes,
        rejectedByNameSnapshot: requisition.rejectedByNameSnapshot,
        rejectedAtUtc: requisition.rejectedAtUtc,

        collectionChargesBanksAndBins: requisition.collectionChargesBanksAndBins.map((row) => ({
            clientId: row.id,
            id: row.id,

            date: parseDateOnly(row.date),

            collectionTypeId: row.collectionTypeId,
            collectionTypeLabel: row.collectionTypeName,
            collectionTypeCode: row.collectionTypeCode,

            locationId: row.locationId,
            locationLabel: row.locationName,
            locationPostCode: row.locationPostCode,

            numberOfBags: row.numberOfBags,

            chargeType: row.chargeType,

            miles: row.miles,
            ratePerMile: row.ratePerMile,
            flatCharge: row.flatCharge,

            totalValue: row.totalValue,
        })),

        collectionVanPacks: requisition.collectionVanPacks.map((row) => ({
            clientId: row.id,
            id: row.id,

            deliveryDate: parseDateOnly(row.deliveryDate),

            postCodeZone: row.postCodeZone,

            vanPacksOut: row.vanPacksOut,
            filledBags: row.filledBags,

            unusedVanPacks: row.unusedVanPacks,
            percentReturned: row.percentReturned,

            ratePerVanPack: row.ratePerVanPack,
            totalValue: row.totalValue,
        })),

        submissionHistory: requisition.submissionHistory,
    };
}
