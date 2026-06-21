import { StdChargeType } from "../constants/std-charge-type.constants";
import type { StdSubmissionStatus } from "../std-submissions-view/submission-status";

export type StdRequisitionSubmissionDetail = {
    id: string;
    requisitionId: string;

    submissionNumber: number;

    status: StdSubmissionStatus;

    submittedByName: string;
    submittedAtUtc: string;

    poNumber: string | null;

    reviewedByName: string | null;
    reviewedAtUtc: string | null;

    rejectionNotes: string | null;

    snapshot: StdRequisitionSnapshot;
};

export type ApproveStdRequisitionRequest = {
    rowVersion: string | null;
};

export type RejectStdRequisitionRequest = {
    rowVersion: string | null;
    rejectionNotes: string;
};

export type StdRequisitionSubmissionHistory = {
    id: string;
    submissionNumber: number;
    status: StdSubmissionStatus;
    submittedByNameSnapshot: string;
    submittedAtUtc: string;
    reviewedByNameSnapshot: string | null;
    reviewedAtUtc: string | null;
    poNumber: string | null;
    rejectionNotes: string | null;
};

export type StdRequisitionSnapshot = {
    requisitionNumber: string;
    requisitionDate: string;

    vanDriverCode: string;
    vanDriverName: string;
    tradersName: string;

    shopCode: string;
    shopName: string;

    isVatApplicable: boolean;

    subtotal: number;

    collectionChargesBanksAndBins: StdCollectionChargeBanksAndBinsSnapshot[];
    collectionVanPacks: StdCollectionVanPackSnapshot[];
    pickups: StdPickupSnapshot[];
    transfers: StdTransferSnapshot[];
    additionalCosts: StdAdditionalCostSnapshot[];
};

export type StdCollectionChargeBanksAndBinsSnapshot = {
    date: string;

    collectionTypeId: string;
    collectionTypeName: string;
    collectionTypeCode: string;

    locationId: string;
    locationName: string;
    locationPostCode: string;

    numberOfBags: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;

    totalValue: number | null;
};

export type StdCollectionVanPackSnapshot = {
    deliveryDate: string;
    postCodeZone: string;
    vanPacksOut: number;
    filledBags: number;
    unusedVanPacks: number;
    percentReturned: number;
    ratePerVanPack: number;
    totalValue: number;
};

export type StdPickupSnapshot = {
    date: string;
    numberOfBags: number;
    numberOfHouseholds: number;
    chargeType: StdChargeType;
    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;
    totalValue: number;
};

export type StdTransferSnapshot = {
    date: string;

    shopIdFrom: string;
    shopCodeFrom: string;
    shopNameFrom: string;

    shopIdTo: string;
    shopCodeTo: string;
    shopNameTo: string;

    numberOfBags: number | null;
    numberOfBoxes: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;

    totalValue: number;
};

export type StdAdditionalCostSnapshot = {
    date: string;

    reasonId: string;
    reasonName: string;

    numberOfBags: number;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;

    totalValue: number;
};