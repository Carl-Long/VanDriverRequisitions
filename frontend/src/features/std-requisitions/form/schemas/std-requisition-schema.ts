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

        locationId: z
            .string()
            .nullable()
            .refine((value) => value !== null, "Location is required"),

        numberOfBags: z.number().int().min(0).nullable(),

        chargeType: z.enum(["Mileage", "FlatCharge"]),

        miles: z.number().int().min(0).nullable(),
        ratePerMile: z.number().min(0).nullable(),
        flatCharge: z.number().min(0).nullable(),

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

        ratePerVanPack: z.number().min(0),
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
        })
        .superRefine((data, ctx) => {
            const totalRows =
                data.collectionChargesBanksAndBins.length + data.collectionVanPacks.length;

            if (totalRows === 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["form"],
                    message: "At least one requisition row is required",
                });
            }
        });
}
