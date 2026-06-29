import type { StdChargeType } from "../../constants/std-charge-type.constants";

export type StdTransferDraft = {
    clientId: string;
    id: string | null;

    date: Date | null;

    shopIdFrom: string | null;
    shopLabelFrom: string | null;
    shopCodeFrom: string | null;
    shopNameFrom: string | null;
    isShopFromActive: boolean;

    shopIdTo: string | null;
    shopLabelTo: string | null;
    shopCodeTo: string | null;
    shopNameTo: string | null;
    isShopToActive: boolean;

    numberOfBags: number | null;
    numberOfBoxes: number | null;

    chargeType: StdChargeType;

    miles: number | null;
    ratePerMile: number | null;
    flatCharge: number | null;

    totalValue: number;
};