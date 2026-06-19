import { StdChargeType } from "../constants/std-charge-type.constants";

export type StdRequisitionSubmissionDetail = {
    id: string;
    requisitionId: string;

    submissionNumber: number;

    status: string;

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
    status: string;
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