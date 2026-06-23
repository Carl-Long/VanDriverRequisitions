import { StdChargeType } from "../constants/std-charge-type.constants";

export type SaveStdRequisition = {
    rowVersion: string | null;
    requisitionDate: string;
    vanDriverId: string;
    vanDriverName: string;
    shopId: string;
    collectionChargesBanksAndBins: SaveStdCollectionChargeBanksAndBins[];
    collectionVanPacks: SaveStdCollectionVanPack[];
    pickups: SaveStdPickup[];
    transfers: SaveStdTransfer[];
    additionalCosts: SaveStdAdditionalCost[];
};

export type SaveStdCollectionChargeBanksAndBins = {
    id?: string | null;
    date: string;

    collectionTypeId: string;
    locationId: string;

    numberOfBags: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;
};

export type SaveStdCollectionVanPack = {
    id: string | null;
    deliveryDate: string;
    postCodeZone: string;
    vanPacksOut: number;
    filledBags: number;
};

export type SaveStdPickup = {
    id: string | null;
    date: string;
    numberOfBags: number;
    numberOfHouseholds: number;
    chargeType: StdChargeType;
    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;
};

export type SaveStdTransfer = {
    id: string | null;
    date: string;

    shopIdFrom: string;
    shopIdTo: string;

    numberOfBags: number | null;
    numberOfBoxes: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;
};

export type SaveStdAdditionalCost = {
    id: string | null;
    date: string;
    reasonId: string;
    numberOfBags: number;
    chargeType: StdChargeType;
    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;
};