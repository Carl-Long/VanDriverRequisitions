import type { StdRequisitionDraft } from "../types/std-requisition-draft";

export function createEmptyStdRequisitionDraft(): StdRequisitionDraft {
    return {
        requisitionId: null,
        rowVersion: null,
        requisitionNumber: null,
        status: null,

        requisitionDate: new Date(),

        vanDriverId: null,
        vanDriverLabel: null,
        vanDriverSummary: null,
        vanDriverName: "",

        shopId: null,
        shopLabel: null,
        isShopActive: true,

        submittedByNameSnapshot: null,
        submittedAtUtc: null,

        approvedByNameSnapshot: null,
        approvedAtUtc: null,
        poNumber: null,

        rejectedByNameSnapshot: null,
        rejectedAtUtc: null,
        rejectionNotes: null,

        collectionChargesBanksAndBins: [],
        collectionVanPacks: [],
        pickups: [],
        transfers: [],
        additionalCosts: [],

        submissionHistory: [],
    };
}