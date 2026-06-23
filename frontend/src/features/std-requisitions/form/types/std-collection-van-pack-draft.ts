export type StdCollectionVanPackDraft = {
    clientId: string;
    id: string | null;

    deliveryDate: Date | null;

    postCodeZone: string | null;

    vanPacksOut: number | null;
    filledBags: number | null;

    unusedVanPacks: number;
    percentReturned: number;

    ratePerVanPack: number;
    totalValue: number;
};