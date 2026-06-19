import { toDateOnlyString } from "@/lib/format/date";
import type { SaveStdRequisition } from "../../types/std-requisition-save.types";
import type { StdRequisitionDraft } from "../types/std-requisition-draft";

export function mapStdRequisitionDraftToSaveRequest(
    draft: StdRequisitionDraft,
): SaveStdRequisition {
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
        requisitionDate: toDateOnlyString(draft.requisitionDate) ?? "",
        vanDriverId: draft.vanDriverId,
        vanDriverName: draft.vanDriverName?.trim() ?? "",
        shopId: draft.shopId,

        collectionChargesBanksAndBins: draft.collectionChargesBanksAndBins.map((row) => {
            if (!row.date) {
                throw new Error("Banks & Bins date is required.");
            }

            if (!row.collectionTypeId) {
                throw new Error("Banks & Bins collection type is required.");
            }

            if (!row.locationId) {
                throw new Error("Banks & Bins location is required.");
            }

            return {
                id: row.id,
                date: toDateOnlyString(row.date) ?? "",
                collectionTypeId: row.collectionTypeId,
                locationId: row.locationId,
                numberOfBags: row.numberOfBags,
                chargeType: row.chargeType,
                miles: row.chargeType === "Mileage" ? row.miles : null,
                ratePerMile: row.chargeType === "Mileage" ? row.ratePerMile : null,
                flatCharge: row.chargeType === "FlatCharge" ? row.flatCharge : null,
            };
        }),
    };
}