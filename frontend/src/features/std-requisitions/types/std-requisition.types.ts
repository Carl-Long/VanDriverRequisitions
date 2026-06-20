import { VanDriverLookup } from "@/lib/api/van-drivers";
import { StdChargeType } from "../constants/std-charge-type.constants";
import { StdRequisitionSubmissionHistory } from "./std-requisition-submission.types";

export type StdRequisitionSummary = {
    id: string;
    requisitionNumber: string;
    requisitionDate: string;
    vanDriverCode: string;
    vanDriverName: string;
    tradersName: string;
    shopCode: string;
    shopName: string;
    status: string;
    subtotal: number;
    createdAtUtc: string;
    createdById: string;
    createdByNameSnapshot: string;
    updatedAtUtc: string | null;
    updatedByNameSnapshot: string | null;
};

export type StdRequisitionQuery = {
    page?: number;
    pageSize?: number;
    requisitionNumber?: string;
    status?: string;
    shopId?: string;
    createdByUserId?: string;
};

export type StdRequisitionDetail = {
    id: string;
    rowVersion: string | null;
    requisitionNumber: string;
    requisitionDate: string;

    vanDriverSummary: VanDriverLookup;
    vanDriverId: string;
    vanDriverName: string;

    shopId: string;
    shopCode: string;
    shopName: string;
    isShopActive: boolean;

    status: string;
    subtotal: number;
    isEditable: boolean;

    collectionChargesBanksAndBins: StdCollectionChargeBanksAndBins[];
    collectionVanPacks: StdCollectionVanPack[];

    submittedByNameSnapshot: string | null;
    submittedAtUtc: string | null;

    approvedByNameSnapshot: string | null;
    approvedAtUtc: string | null;
    poNumber: string | null;

    rejectedByNameSnapshot: string | null;
    rejectedAtUtc: string | null;
    rejectionNotes: string | null;

    submissionHistory: StdRequisitionSubmissionHistory[];
};

export type StdCollectionChargeBanksAndBins = {
    id: string;
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

export type StdCollectionVanPack = {
    id: string;
    deliveryDate: string;
    postCodeZone: string;
    vanPacksOut: number;
    filledBags: number;
    unusedVanPacks: number;
    percentReturned: number;
    ratePerVanPack: number;
    totalValue: number;
};
