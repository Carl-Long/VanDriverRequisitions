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