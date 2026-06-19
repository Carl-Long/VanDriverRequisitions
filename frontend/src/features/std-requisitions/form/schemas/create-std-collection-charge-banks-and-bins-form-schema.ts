import { z } from "zod";

export function createStdCollectionChargeBanksAndBinsFormSchema() {
    return z
        .object({
            date: z.date({
                error: "Date is required",
            }),

            collectionTypeId: z
                .string()
                .nullable()
                .refine((x) => x !== null, "Collection type is required"),

            collectionTypeLabel: z.string().nullable(),
            collectionTypeCode: z.string().nullable(),

            locationId: z
                .string()
                .nullable()
                .refine((x) => x !== null, "Location is required"),

            locationLabel: z.string().nullable(),
            locationPostCode: z.string().nullable(),

            numberOfBags: z
                .number()
                .int("Must be a whole number")
                .min(0, "Cannot be negative")
                .nullable(),

            chargeType: z.enum(["Mileage", "FlatCharge"]),

            miles: z.number().int("Must be a whole number").min(0, "Cannot be negative").nullable(),

            ratePerMile: z.number().min(0, "Cannot be negative").nullable(),

            flatCharge: z.number().min(0, "Cannot be negative").nullable(),
        })
        .superRefine((form, ctx) => {
            if (form.chargeType === "Mileage") {
                if (form.miles === null || form.miles <= 0) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["miles"],
                        message: "Miles are required",
                    });
                }

                if (form.ratePerMile === null) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["ratePerMile"],
                        message: "Rate per mile is required",
                    });
                }

                if (form.flatCharge !== null) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["form"],
                        message: "Flat charge must be empty for mileage charges",
                    });
                }
            }

            if (form.chargeType === "FlatCharge") {
                if (form.flatCharge === null) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["flatCharge"],
                        message: "Flat charge is required",
                    });
                }

                if (form.miles !== null || form.ratePerMile !== null) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["form"],
                        message: "Mileage fields must be empty for flat charges",
                    });
                }
            }
        });
}