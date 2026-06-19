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

export function createStdRequisitionSchema() {
    return z.object({
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

        collectionChargesBanksAndBins: z
            .array(banksAndBinsRowSchema)
            .min(1, "At least one Banks & Bins row is required"),
    });
}