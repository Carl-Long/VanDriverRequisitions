import { describe, expect, it } from "vitest";

import { mapStdRequisitionDraftToSaveRequest } from "@/features/std-requisitions/form/lib/map-std-requisition-draft-to-save-request";
import type { StdRequisitionDraft } from "@/features/std-requisitions/form/types/std-requisition-draft";

function createDraft(
    overrides: Partial<StdRequisitionDraft> = {},
): StdRequisitionDraft {
    return {
        requisitionId: "requisition-id",
        rowVersion: "row-version",
        requisitionNumber: "STD-10001",
        status: "Draft",
        requisitionDate: new Date(2026, 5, 13),

        vanDriverId: "driver-id",
        vanDriverLabel: "VD001 - Test Driver",
        vanDriverSummary: null,
        vanDriverName: "Test Driver",

        shopId: "shop-id",
        shopLabel: "001 - Test Shop",
        isShopActive: true,

        submittedByNameSnapshot: null,
        submittedAtUtc: null,

        poNumber: null,
        approvedByNameSnapshot: null,
        approvedAtUtc: null,

        rejectionNotes: null,
        rejectedByNameSnapshot: null,
        rejectedAtUtc: null,

        pickups: [],
        transfers: [],
        collectionChargesBanksAndBins: [],
        collectionVanPacks: [],
        additionalCosts: [],
        submissionHistory: [],

        ...overrides,
    };
}

describe("mapStdRequisitionDraftToSaveRequest", () => {
    it("maps root fields and child rows to the STD save request contract", () => {
        const draft = createDraft({
            pickups: [
                {
                    id: "pickup-id",
                    clientId: "pickup-client-id",
                    date: new Date(2026, 5, 14),
                    numberOfBags: 5,
                    numberOfHouseholds: 2,
                    chargeType: "FlatCharge",
                    miles: 99,
                    ratePerMile: 99,
                    flatCharge: 10,
                    totalValue: 10,
                },
            ],

            transfers: [
                {
                    id: "transfer-id",
                    clientId: "transfer-client-id",
                    date: new Date(2026, 5, 15),

                    shopIdFrom: "from-shop-id",
                    shopLabelFrom: "001 - From Shop",
                    shopCodeFrom: "001",
                    shopNameFrom: "From Shop",
                    isShopFromActive: true,

                    shopIdTo: "to-shop-id",
                    shopLabelTo: "002 - To Shop",
                    shopCodeTo: "002",
                    shopNameTo: "To Shop",
                    isShopToActive: true,

                    numberOfBags: 3,
                    numberOfBoxes: 2,

                    chargeType: "Mileage",
                    miles: 20,
                    ratePerMile: 0.5,
                    flatCharge: 99,

                    totalValue: 10,
                },
            ],

            collectionChargesBanksAndBins: [
                {
                    id: "banks-id",
                    clientId: "banks-client-id",
                    date: new Date(2026, 5, 16),

                    collectionTypeId: "collection-type-id",
                    collectionTypeLabel: "Banks",
                    collectionTypeCode: "BANKS",
                    isCollectionTypeActive: true,

                    locationId: "location-id",
                    locationLabel: "Location A",
                    locationPostCode: "AB1 2CD",
                    isLocationActive: true,

                    numberOfBags: 4,

                    chargeType: "FlatCharge",
                    miles: 99,
                    ratePerMile: 99,
                    flatCharge: 12,

                    totalValue: 12,
                },
            ],

            collectionVanPacks: [
                {
                    id: "van-pack-id",
                    clientId: "van-pack-client-id",
                    deliveryDate: new Date(2026, 5, 17),
                    postCodeZone: " ab ",
                    vanPacksOut: 2,
                    filledBags: 10,
                    unusedVanPacks: 0,
                    percentReturned: 0,
                    ratePerVanPack: 7,
                    totalValue: 14,
                },
            ],

            additionalCosts: [
                {
                    id: "additional-cost-id",
                    clientId: "additional-cost-client-id",
                    date: new Date(2026, 5, 18),

                    reasonId: "reason-id",
                    reasonCode: "100",
                    reasonText: "Parking",
                    isReasonActive: true,

                    numberOfBags: 6,

                    chargeType: "Mileage",
                    miles: 10,
                    ratePerMile: 0.45,
                    flatCharge: 99,

                    totalValue: 4.5,
                },
            ],
        });

        const result = mapStdRequisitionDraftToSaveRequest(draft);

        expect(result).toEqual({
            rowVersion: "row-version",
            requisitionDate: "2026-06-13",
            vanDriverId: "driver-id",
            vanDriverName: "Test Driver",
            shopId: "shop-id",

            collectionChargesBanksAndBins: [
                {
                    id: "banks-id",
                    date: "2026-06-16",
                    collectionTypeId: "collection-type-id",
                    locationId: "location-id",
                    numberOfBags: 4,
                    chargeType: "FlatCharge",
                    miles: null,
                    ratePerMile: null,
                    flatCharge: 12,
                },
            ],

            collectionVanPacks: [
                {
                    id: "van-pack-id",
                    deliveryDate: "2026-06-17",
                    postCodeZone: "AB",
                    vanPacksOut: 2,
                    filledBags: 10,
                },
            ],

            pickups: [
                {
                    id: "pickup-id",
                    date: "2026-06-14",
                    numberOfBags: 5,
                    numberOfHouseholds: 2,
                    chargeType: "FlatCharge",
                    miles: null,
                    ratePerMile: null,
                    flatCharge: 10,
                },
            ],

            transfers: [
                {
                    id: "transfer-id",
                    date: "2026-06-15",
                    shopIdFrom: "from-shop-id",
                    shopIdTo: "to-shop-id",
                    numberOfBags: 3,
                    numberOfBoxes: 2,
                    chargeType: "Mileage",
                    miles: 20,
                    ratePerMile: 0.5,
                    flatCharge: null,
                },
            ],

            additionalCosts: [
                {
                    id: "additional-cost-id",
                    date: "2026-06-18",
                    reasonId: "reason-id",
                    numberOfBags: 6,
                    chargeType: "Mileage",
                    miles: 10,
                    ratePerMile: 0.45,
                    flatCharge: null,
                },
            ],
        });
    });

    it("throws when requisition date is missing", () => {
        const draft = createDraft({
            requisitionDate: null,
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Requisition date is required.",
        );
    });

    it("throws when van driver is missing", () => {
        const draft = createDraft({
            vanDriverId: null,
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Van driver is required.",
        );
    });

    it("throws when shop is missing", () => {
        const draft = createDraft({
            shopId: null,
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Shop is required.",
        );
    });

    it("throws when pickup date is missing", () => {
        const draft = createDraft({
            pickups: [
                {
                    id: null,
                    clientId: "client-id",
                    date: null,
                    numberOfBags: 1,
                    numberOfHouseholds: 1,
                    chargeType: "FlatCharge",
                    miles: null,
                    ratePerMile: null,
                    flatCharge: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Pickup date is required.",
        );
    });

    it("throws when pickup bags are missing", () => {
        const draft = createDraft({
            pickups: [
                {
                    id: null,
                    clientId: "client-id",
                    date: new Date(2026, 5, 13),
                    numberOfBags: null,
                    numberOfHouseholds: 1,
                    chargeType: "FlatCharge",
                    miles: null,
                    ratePerMile: null,
                    flatCharge: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Pickup bags are required.",
        );
    });

    it("throws when pickup households are missing", () => {
        const draft = createDraft({
            pickups: [
                {
                    id: null,
                    clientId: "client-id",
                    date: new Date(2026, 5, 13),
                    numberOfBags: 1,
                    numberOfHouseholds: null,
                    chargeType: "FlatCharge",
                    miles: null,
                    ratePerMile: null,
                    flatCharge: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Pickup households are required.",
        );
    });

    it("throws when transfer from shop is missing", () => {
        const draft = createDraft({
            transfers: [
                {
                    id: null,
                    clientId: "client-id",
                    date: new Date(2026, 5, 13),
                    shopIdFrom: null,
                    shopLabelFrom: null,
                    shopCodeFrom: null,
                    shopNameFrom: null,
                    isShopFromActive: true,
                    shopIdTo: "to-shop-id",
                    shopLabelTo: "002 - To",
                    shopCodeTo: "002",
                    shopNameTo: "To",
                    isShopToActive: true,
                    numberOfBags: 1,
                    numberOfBoxes: 1,
                    chargeType: "Mileage",
                    miles: 10,
                    ratePerMile: 0.5,
                    flatCharge: null,
                    totalValue: 5,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Transfer from shop is required.",
        );
    });

    it("throws when transfer to shop is missing", () => {
        const draft = createDraft({
            transfers: [
                {
                    id: null,
                    clientId: "client-id",
                    date: new Date(2026, 5, 13),
                    shopIdFrom: "from-shop-id",
                    shopLabelFrom: "001 - From",
                    shopCodeFrom: "001",
                    shopNameFrom: "From",
                    isShopFromActive: true,
                    shopIdTo: null,
                    shopLabelTo: null,
                    shopCodeTo: null,
                    shopNameTo: null,
                    isShopToActive: true,
                    numberOfBags: 1,
                    numberOfBoxes: 1,
                    chargeType: "Mileage",
                    miles: 10,
                    ratePerMile: 0.5,
                    flatCharge: null,
                    totalValue: 5,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Transfer to shop is required.",
        );
    });

    it("throws when transfer date is missing", () => {
        const draft = createDraft({
            transfers: [
                {
                    id: null,
                    clientId: "client-id",
                    date: null,
                    shopIdFrom: "from-shop-id",
                    shopLabelFrom: "001 - From",
                    shopCodeFrom: "001",
                    shopNameFrom: "From",
                    isShopFromActive: true,
                    shopIdTo: "to-shop-id",
                    shopLabelTo: "002 - To",
                    shopCodeTo: "002",
                    shopNameTo: "To",
                    isShopToActive: true,
                    numberOfBags: 1,
                    numberOfBoxes: 1,
                    chargeType: "Mileage",
                    miles: 10,
                    ratePerMile: 0.5,
                    flatCharge: null,
                    totalValue: 5,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Transfer date is required.",
        );
    });

    it("throws when banks and bins date is missing", () => {
        const draft = createDraft({
            collectionChargesBanksAndBins: [
                {
                    id: null,
                    clientId: "client-id",
                    date: null,
                    collectionTypeId: "collection-type-id",
                    collectionTypeLabel: "Banks",
                    collectionTypeCode: "BANKS",
                    isCollectionTypeActive: true,
                    locationId: "location-id",
                    locationLabel: "Location",
                    locationPostCode: "AB1 2CD",
                    isLocationActive: true,
                    numberOfBags: 1,
                    chargeType: "Mileage",
                    miles: 10,
                    ratePerMile: 0.5,
                    flatCharge: null,
                    totalValue: 5,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Banks & Bins date is required.",
        );
    });

    it("throws when banks and bins collection type is missing", () => {
        const draft = createDraft({
            collectionChargesBanksAndBins: [
                {
                    id: null,
                    clientId: "client-id",
                    date: new Date(2026, 5, 13),
                    collectionTypeId: null,
                    collectionTypeLabel: null,
                    collectionTypeCode: null,
                    isCollectionTypeActive: true,
                    locationId: "location-id",
                    locationLabel: "Location",
                    locationPostCode: "AB1 2CD",
                    isLocationActive: true,
                    numberOfBags: 1,
                    chargeType: "Mileage",
                    miles: 10,
                    ratePerMile: 0.5,
                    flatCharge: null,
                    totalValue: 5,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Banks & Bins collection type is required.",
        );
    });

    it("throws when banks and bins location is missing", () => {
        const draft = createDraft({
            collectionChargesBanksAndBins: [
                {
                    id: null,
                    clientId: "client-id",
                    date: new Date(2026, 5, 13),
                    collectionTypeId: "collection-type-id",
                    collectionTypeLabel: "Banks",
                    collectionTypeCode: "BANKS",
                    isCollectionTypeActive: true,
                    locationId: null,
                    locationLabel: null,
                    locationPostCode: null,
                    isLocationActive: true,
                    numberOfBags: 1,
                    chargeType: "Mileage",
                    miles: 10,
                    ratePerMile: 0.5,
                    flatCharge: null,
                    totalValue: 5,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Banks & Bins location is required.",
        );
    });

    it("throws when van pack delivery date is missing", () => {
        const draft = createDraft({
            collectionVanPacks: [
                {
                    id: null,
                    clientId: "client-id",
                    deliveryDate: null,
                    postCodeZone: "AB",
                    vanPacksOut: 1,
                    filledBags: 1,
                    unusedVanPacks: 0,
                    percentReturned: 0,
                    ratePerVanPack: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Van Pack delivery date is required.",
        );
    });

    it("throws when van pack postcode zone is missing", () => {
        const draft = createDraft({
            collectionVanPacks: [
                {
                    id: null,
                    clientId: "client-id",
                    deliveryDate: new Date(2026, 5, 13),
                    postCodeZone: "",
                    vanPacksOut: 1,
                    filledBags: 1,
                    unusedVanPacks: 0,
                    percentReturned: 0,
                    ratePerVanPack: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Van Pack postcode zone is required.",
        );
    });

    it("throws when van packs out is missing", () => {
        const draft = createDraft({
            collectionVanPacks: [
                {
                    id: null,
                    clientId: "client-id",
                    deliveryDate: new Date(2026, 5, 13),
                    postCodeZone: "AB",
                    vanPacksOut: null,
                    filledBags: 1,
                    unusedVanPacks: 0,
                    percentReturned: 0,
                    ratePerVanPack: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Van packs out is required.",
        );
    });

    it("throws when filled bags is missing", () => {
        const draft = createDraft({
            collectionVanPacks: [
                {
                    id: null,
                    clientId: "client-id",
                    deliveryDate: new Date(2026, 5, 13),
                    postCodeZone: "AB",
                    vanPacksOut: 1,
                    filledBags: null,
                    unusedVanPacks: 0,
                    percentReturned: 0,
                    ratePerVanPack: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Filled bags is required.",
        );
    });

    it("throws when additional cost reason is missing", () => {
        const draft = createDraft({
            additionalCosts: [
                {
                    id: null,
                    clientId: "client-id",
                    date: new Date(2026, 5, 13),
                    reasonId: null,
                    reasonCode: null,
                    reasonText: null,
                    isReasonActive: true,
                    numberOfBags: 1,
                    chargeType: "FlatCharge",
                    miles: null,
                    ratePerMile: null,
                    flatCharge: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Additional cost reason is required.",
        );
    });

    it("throws when additional cost number of bags is missing", () => {
        const draft = createDraft({
            additionalCosts: [
                {
                    id: null,
                    clientId: "client-id",
                    date: new Date(2026, 5, 13),
                    reasonId: "reason-id",
                    reasonCode: "100",
                    reasonText: "Parking",
                    isReasonActive: true,
                    numberOfBags: null,
                    chargeType: "FlatCharge",
                    miles: null,
                    ratePerMile: null,
                    flatCharge: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Additional cost number of bags is required.",
        );
    });

    it("throws when additional cost date is missing", () => {
        const draft = createDraft({
            additionalCosts: [
                {
                    id: null,
                    clientId: "client-id",
                    date: null,
                    reasonId: "reason-id",
                    reasonCode: "100",
                    reasonText: "Parking",
                    isReasonActive: true,
                    numberOfBags: 1,
                    chargeType: "FlatCharge",
                    miles: null,
                    ratePerMile: null,
                    flatCharge: 10,
                    totalValue: 10,
                },
            ],
        });

        expect(() => mapStdRequisitionDraftToSaveRequest(draft)).toThrow(
            "Additional cost date is required.",
        );
    });
});