import { hasMaxTwoDecimalPlaces, MIN_MONEY_AMOUNT } from "@/lib/validation/money";
import { isUkPostcodeOutwardCode } from "@/lib/validation/uk-postcode";
import { z } from "zod";

const banksAndBinsRowSchema = z
    .object({
        clientId: z.string(),
        id: z.string().nullable(),

        date: z
            .date()
            .nullable()
            .refine((value) => value !== null, "Date is required"),

        collectionTypeId: z
            .string()
            .nullable()
            .refine((value) => value !== null, "Collection type is required"),

        collectionTypeLabel: z.string().nullable(),
        collectionTypeCode: z.string().nullable(),
        isCollectionTypeActive: z.boolean(),

        locationId: z
            .string()
            .nullable()
            .refine((value) => value !== null, "Location is required"),


        locationLabel: z.string().nullable(),
        locationPostCode: z.string().nullable(),
        isLocationActive: z.boolean(),

        numberOfBags: z.number().int().min(0).nullable(),

        chargeType: z.enum(["Mileage", "FlatCharge"]),

        miles: z.number().int().min(0).nullable(),
        ratePerMile: z
            .number()
            .min(MIN_MONEY_AMOUNT, "Rate per mile must be at least £0.01")
            .refine(
                hasMaxTwoDecimalPlaces,
                "Rate per mile can have a maximum of 2 decimal places",
            )
            .nullable(),

        flatCharge: z
            .number()
            .min(MIN_MONEY_AMOUNT, "Flat charge must be at least £0.01")
            .refine(
                hasMaxTwoDecimalPlaces,
                "Flat charge can have a maximum of 2 decimal places",
            )
            .nullable(),

        totalValue: z.number().nullable(),
    })
    .superRefine((row, ctx) => {
        if (row.chargeType === "Mileage") {
            if (row.miles === null || row.miles <= 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["miles"],
                    message: "Miles are required",
                });
            }

            if (row.ratePerMile === null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["ratePerMile"],
                    message: "Rate per mile is required",
                });
            }
        }

        if (row.chargeType === "FlatCharge" && row.flatCharge === null) {
            ctx.addIssue({
                code: "custom",
                path: ["flatCharge"],
                message: "Flat charge is required",
            });
        }
    });

const vanPackRowSchema = z
    .object({
        clientId: z.string(),
        id: z.string().nullable(),

        deliveryDate: z
            .date()
            .nullable()
            .refine((value) => value !== null, "Delivery date is required"),

        postCodeZone: z
            .string()
            .trim()
            .min(1, "Postcode zone is required")
            .refine(
                (value) => isUkPostcodeOutwardCode(value),
                "Enter a valid postcode zone, for example M1, B33 or SW1A",
            ),

        vanPacksOut: z
            .number()
            .int("Must be a whole number")
            .min(1, "Van packs out must be greater than zero")
            .nullable(),

        filledBags: z
            .number()
            .int("Must be a whole number")
            .min(1, "Filled bags must be greater than zero")
            .nullable(),

        unusedVanPacks: z.number(),
        percentReturned: z.number(),

        ratePerVanPack: z.number().gt(0, "Rate per van pack must be greater than zero"),
        totalValue: z.number().min(0),
    })
    .superRefine((row, ctx) => {
        if (row.vanPacksOut === null) {
            ctx.addIssue({
                code: "custom",
                path: ["vanPacksOut"],
                message: "Van packs out is required",
            });
        }

        if (row.filledBags === null) {
            ctx.addIssue({
                code: "custom",
                path: ["filledBags"],
                message: "Filled bags is required",
            });
        }

        if (
            row.vanPacksOut !== null &&
            row.filledBags !== null &&
            row.filledBags > row.vanPacksOut
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["filledBags"],
                message: "Filled bags cannot be greater than van packs out",
            });
        }
    });

const pickupRowSchema = z
    .object({
        clientId: z.string(),
        id: z.string().nullable(),

        date: z
            .date()
            .nullable()
            .refine((value) => value !== null, "Date is required"),

        numberOfBags: z
            .number()
            .int("Must be a whole number")
            .min(1, "Bags must be greater than zero")
            .nullable(),

        numberOfHouseholds: z
            .number()
            .int("Must be a whole number")
            .min(1, "Households must be greater than zero")
            .nullable(),

        chargeType: z.enum(["Mileage", "FlatCharge"]),

        miles: z.number().int("Must be a whole number").min(0, "Cannot be negative").nullable(),
        ratePerMile: z
            .number()
            .min(MIN_MONEY_AMOUNT, "Rate per mile must be at least £0.01")
            .refine(
                hasMaxTwoDecimalPlaces,
                "Rate per mile can have a maximum of 2 decimal places",
            )
            .nullable(),

        flatCharge: z
            .number()
            .min(MIN_MONEY_AMOUNT, "Flat charge must be at least £0.01")
            .refine(
                hasMaxTwoDecimalPlaces,
                "Flat charge can have a maximum of 2 decimal places",
            )
            .nullable(),

        totalValue: z.number().min(0),
    })
    .superRefine((row, ctx) => {
        if (row.numberOfBags === null) {
            ctx.addIssue({
                code: "custom",
                path: ["numberOfBags"],
                message: "Bags are required",
            });
        }

        if (row.numberOfHouseholds === null) {
            ctx.addIssue({
                code: "custom",
                path: ["numberOfHouseholds"],
                message: "Households are required",
            });
        }

        if (row.chargeType === "Mileage") {
            if (row.miles === null || row.miles <= 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["miles"],
                    message: "Miles are required",
                });
            }

            if (row.ratePerMile === null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["ratePerMile"],
                    message: "Rate per mile is required",
                });
            }
        }

        if (row.chargeType === "FlatCharge" && row.flatCharge === null) {
            ctx.addIssue({
                code: "custom",
                path: ["flatCharge"],
                message: "Flat charge is required",
            });
        }
    });

const transferRowSchema = z
    .object({
        clientId: z.string(),
        id: z.string().nullable(),

        date: z
            .date()
            .nullable()
            .refine((value) => value !== null, "Date is required"),

        shopIdFrom: z.string().nullable(),
        shopLabelFrom: z.string().nullable(),
        shopCodeFrom: z.string().nullable(),
        shopNameFrom: z.string().nullable(),

        shopIdTo: z.string().nullable(),
        shopLabelTo: z.string().nullable(),
        shopCodeTo: z.string().nullable(),
        shopNameTo: z.string().nullable(),

        numberOfBags: z
            .number()
            .int("Must be a whole number")
            .min(0, "Cannot be negative")
            .nullable(),

        numberOfBoxes: z
            .number()
            .int("Must be a whole number")
            .min(0, "Cannot be negative")
            .nullable(),

        chargeType: z.enum(["Mileage", "FlatCharge"]),

        miles: z
            .number()
            .int("Must be a whole number")
            .min(0, "Cannot be negative")
            .nullable(),

        ratePerMile: z
            .number()
            .min(MIN_MONEY_AMOUNT, "Rate per mile must be at least £0.01")
            .refine(
                hasMaxTwoDecimalPlaces,
                "Rate per mile can have a maximum of 2 decimal places",
            )
            .nullable(),

        flatCharge: z
            .number()
            .min(MIN_MONEY_AMOUNT, "Flat charge must be at least £0.01")
            .refine(
                hasMaxTwoDecimalPlaces,
                "Flat charge can have a maximum of 2 decimal places",
            )
            .nullable(),

        totalValue: z.number().min(0),
    })
    .superRefine((row, ctx) => {
        if (!row.shopIdFrom) {
            ctx.addIssue({
                code: "custom",
                path: ["shopIdFrom"],
                message: "From shop is required",
            });
        }

        if (!row.shopIdTo) {
            ctx.addIssue({
                code: "custom",
                path: ["shopIdTo"],
                message: "To shop is required",
            });
        }

        if (row.shopIdFrom && row.shopIdTo && row.shopIdFrom === row.shopIdTo) {
            ctx.addIssue({
                code: "custom",
                path: ["shopIdTo"],
                message: "From shop and to shop must be different",
            });
        }

        if (row.chargeType === "Mileage") {
            if (row.miles === null || row.miles <= 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["miles"],
                    message: "Miles are required",
                });
            }

            if (row.ratePerMile === null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["ratePerMile"],
                    message: "Rate per mile is required",
                });
            }
        }

        if (row.chargeType === "FlatCharge" && row.flatCharge === null) {
            ctx.addIssue({
                code: "custom",
                path: ["flatCharge"],
                message: "Flat charge is required",
            });
        }
    });

const additionalCostRowSchema = z
    .object({
        clientId: z.string(),
        id: z.string().nullable(),

        date: z
            .date()
            .nullable()
            .refine((value) => value !== null, "Date is required"),

        reasonId: z
            .string()
            .nullable()
            .refine((value) => value !== null, "Reason is required"),

        reasonCode: z.string().nullable(),
        reasonText: z.string().nullable(),
        isReasonActive: z.boolean(),

        numberOfBags: z
            .number()
            .int("Must be a whole number")
            .min(1, "Number of bags must be greater than zero")
            .nullable(),

        chargeType: z.enum(["Mileage", "FlatCharge"]),

        miles: z
            .number()
            .int("Must be a whole number")
            .min(0, "Cannot be negative")
            .nullable(),

        ratePerMile: z
            .number()
            .min(MIN_MONEY_AMOUNT, "Rate per mile must be at least £0.01")
            .refine(
                hasMaxTwoDecimalPlaces,
                "Rate per mile can have a maximum of 2 decimal places",
            )
            .nullable(),

        flatCharge: z
            .number()
            .min(MIN_MONEY_AMOUNT, "Flat charge must be at least £0.01")
            .refine(
                hasMaxTwoDecimalPlaces,
                "Flat charge can have a maximum of 2 decimal places",
            )
            .nullable(),

        totalValue: z.number().min(0),
    })
    .superRefine((row, ctx) => {
        if (row.numberOfBags === null) {
            ctx.addIssue({
                code: "custom",
                path: ["numberOfBags"],
                message: "Number of bags is required",
            });
        }

        if (row.chargeType === "Mileage") {
            if (row.miles === null || row.miles <= 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["miles"],
                    message: "Miles are required",
                });
            }

            if (row.ratePerMile === null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["ratePerMile"],
                    message: "Rate per mile is required",
                });
            }

            if (row.flatCharge !== null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["form"],
                    message: "Flat charge must be empty for mileage charges",
                });
            }
        }

        if (row.chargeType === "FlatCharge") {
            if (row.flatCharge === null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["flatCharge"],
                    message: "Flat charge is required",
                });
            }

            if (row.miles !== null || row.ratePerMile !== null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["form"],
                    message: "Mileage fields must be empty for flat charges",
                });
            }
        }
    });

export function createStdRequisitionSchema() {
    return z
        .object({
            requisitionDate: z
                .date()
                .nullable()
                .refine((value) => value !== null, "Requisition date is required"),

            vanDriverId: z
                .string()
                .nullable()
                .refine((value) => value !== null, "Van driver is required"),

            vanDriverName: z
                .string()
                .nullable()
                .refine((value) => Boolean(value?.trim()), "Van driver name is required"),

            shopId: z
                .string()
                .nullable()
                .refine((value) => value !== null, "Shop is required"),

            collectionChargesBanksAndBins: z.array(banksAndBinsRowSchema),
            collectionVanPacks: z.array(vanPackRowSchema),
            pickups: z.array(pickupRowSchema),
            transfers: z.array(transferRowSchema),
            additionalCosts: z.array(additionalCostRowSchema),
        })
        .superRefine((data, ctx) => {
            const totalRows =
                data.pickups.length +
                data.transfers.length +
                data.collectionChargesBanksAndBins.length +
                data.collectionVanPacks.length +
                data.additionalCosts.length;

            if (totalRows === 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["form"],
                    message: "At least one requisition row is required",
                });
            }
        });
}
