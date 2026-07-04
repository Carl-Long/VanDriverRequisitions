import type { VanDriverLookup } from "@/lib/api/van-drivers";
import type { StdCollectionChargeBanksAndBinsDraft } from "./std-collection-charge-banks-and-bins-draft";
import type { StdSubmissionHistoryDraft } from "./std-submission-history-draft";
import type { StdCollectionVanPackDraft } from "./std-collection-van-pack-draft";
import { StdPickupDraft } from "./std-pickup-draft";
import { StdTransferDraft } from "./std-transfer-draft";
import { StdAdditionalCostDraft } from "./std-additional-cost-draft";
import { RequisitionStatus } from "@/features/requisitions-shared/constants/requisition-status.constants";

export type StdRequisitionDraft = {
    requisitionId: string | null;
    rowVersion: string | null;
    requisitionNumber: string | null;
    status: RequisitionStatus | null;

    requisitionDate: Date | null;

    vanDriverId: string | null;
    vanDriverLabel: string | null;
    vanDriverSummary: VanDriverLookup | null;
    vanDriverName: string | null;

    shopId: string | null;
    shopLabel: string | null;
    isShopActive: boolean;

    submittedByNameSnapshot: string | null;
    submittedAtUtc: string | null;

    poNumber: string | null;
    approvedByNameSnapshot: string | null;
    approvedAtUtc: string | null;

    rejectionNotes: string | null;
    rejectedByNameSnapshot: string | null;
    rejectedAtUtc: string | null;

    collectionChargesBanksAndBins: StdCollectionChargeBanksAndBinsDraft[];
    collectionVanPacks: StdCollectionVanPackDraft[];
    pickups: StdPickupDraft[];
    transfers: StdTransferDraft[];
    additionalCosts: StdAdditionalCostDraft[];

    submissionHistory: StdSubmissionHistoryDraft[];
};