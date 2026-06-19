import type { StdChargeType } from "../../constants/std-charge-type.constants";

export type StdCollectionChargeBanksAndBinsDraft = {
    clientId: string;
    id: string | null;

    date: Date | null;

    collectionTypeId: string | null;
    collectionTypeLabel: string | null;
    collectionTypeCode: string | null;

    locationId: string | null;
    locationLabel: string | null;
    locationPostCode: string | null;

    numberOfBags: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;

    totalValue: number | null;
};