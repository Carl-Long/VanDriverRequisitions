import { toRequiredDateOnlyString } from "@/lib/format/date";
import type { SaveStdRequisition } from "../../types/std-requisition-save.types";
import type { StdRequisitionDraft } from "../types/std-requisition-draft";
import { normaliseUkPostcodeOutwardCode } from "@/lib/validation/uk-postcode";

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
        requisitionDate: toRequiredDateOnlyString(draft.requisitionDate, "Requisition date is required."),
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
                date: toRequiredDateOnlyString(row.date, "Banks and Bins Collection date is required. ") ?? "",
                collectionTypeId: row.collectionTypeId,
                locationId: row.locationId,
                numberOfBags: row.numberOfBags,
                chargeType: row.chargeType,
                miles: row.chargeType === "Mileage" ? row.miles : null,
                ratePerMile: row.chargeType === "Mileage" ? row.ratePerMile : null,
                flatCharge: row.chargeType === "FlatCharge" ? row.flatCharge : null,
            };
        }),

        collectionVanPacks: draft.collectionVanPacks.map((row) => {
            if (row.deliveryDate === null) {
                throw new Error("Van Pack delivery date is required.");
            }

            if (!row.postCodeZone?.trim()) {
                throw new Error("Van Pack postcode zone is required.");
            }

            if (row.vanPacksOut === null) {
                throw new Error("Van packs out is required.");
            }

            if (row.filledBags === null) {
                throw new Error("Filled bags is required.");
            }

            return {
                id: row.id,
                deliveryDate: toRequiredDateOnlyString(row.deliveryDate, "Van Pack delivery date is required."),
                postCodeZone: normaliseUkPostcodeOutwardCode(row.postCodeZone), vanPacksOut: row.vanPacksOut,
                filledBags: row.filledBags,
            };
        }),
    };
}
