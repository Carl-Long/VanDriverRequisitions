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
    pickups: StdPickup[];
    transfers: StdTransfer[];
    additionalCosts: StdAdditionalCost[];

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
    isCollectionTypeActive: boolean;

    locationId: string;
    locationName: string;
    locationPostCode: string;
    isLocationActive: boolean;

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

export type StdPickup = {
    id: string;
    date: string;
    numberOfBags: number;
    numberOfHouseholds: number;
    chargeType: StdChargeType;
    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;
    totalValue: number;
};

export type StdTransfer = {
    id: string;
    date: string;

    shopIdFrom: string;
    shopCodeFrom: string;
    shopNameFrom: string;
    isShopFromActive: boolean;

    shopIdTo: string;
    shopCodeTo: string;
    shopNameTo: string;
    isShopToActive: boolean;

    numberOfBags: number | null;
    numberOfBoxes: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;

    totalValue: number;
};

export type StdAdditionalCost = {
    id: string;
    date: string;

    reasonId: string;
    reasonCode: string;
    reasonText: string;
    isReasonActive: boolean;
    
    numberOfBags: number;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;

    totalValue: number;
};
