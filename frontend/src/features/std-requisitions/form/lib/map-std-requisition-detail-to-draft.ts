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

        pickups: requisition.pickups.map((row) => ({
            clientId: row.id,
            id: row.id,

            date: parseDateOnly(row.date),

            numberOfBags: row.numberOfBags,
            numberOfHouseholds: row.numberOfHouseholds,

            chargeType: row.chargeType,

            miles: row.miles,
            ratePerMile: row.ratePerMile,
            flatCharge: row.flatCharge,

            totalValue: row.totalValue,
        })),

        transfers: requisition.transfers.map((row) => ({
            clientId: row.id,
            id: row.id,

            date: parseDateOnly(row.date),

            shopIdFrom: row.shopIdFrom,
            shopLabelFrom: `${row.shopCodeFrom} - ${row.shopNameFrom}`,
            shopCodeFrom: row.shopCodeFrom,
            shopNameFrom: row.shopNameFrom,

            shopIdTo: row.shopIdTo,
            shopLabelTo: `${row.shopCodeTo} - ${row.shopNameTo}`,
            shopCodeTo: row.shopCodeTo,
            shopNameTo: row.shopNameTo,

            numberOfBags: row.numberOfBags,
            numberOfBoxes: row.numberOfBoxes,

            chargeType: row.chargeType,

            miles: row.miles,
            ratePerMile: row.ratePerMile,
            flatCharge: row.flatCharge,

            totalValue: row.totalValue,
        })),

        additionalCosts: requisition.additionalCosts.map((row) => ({
            clientId: row.id,
            id: row.id,

            date: parseDateOnly(row.date),

            reasonId: row.reasonId,
            reasonName: row.reasonName,

            numberOfBags: row.numberOfBags,

            chargeType: row.chargeType,

            miles: row.miles,
            ratePerMile: row.ratePerMile,
            flatCharge: row.flatCharge,

            totalValue: row.totalValue,
        })),

        submissionHistory: requisition.submissionHistory,
    };
}
