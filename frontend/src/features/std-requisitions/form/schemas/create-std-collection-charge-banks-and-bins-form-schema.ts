import { z } from "zod";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { formatCurrencyGB } from "@/lib/format/currency";

type Params = {
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
};

export function createStdCollectionChargeBanksAndBinsFormSchema({
    mileageLimitRule,
    flatChargeLimitRule,
}: Params) {
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

                if (!mileageLimitRule) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["form"],
                        message:
                            "No STD mileage limit rule is configured. Please contact an administrator.",
                    });

                    return;
                }

                if (form.miles !== null && form.miles > mileageLimitRule.maxQuantity) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["miles"],
                        message: `Maximum mileage of ${mileageLimitRule.maxQuantity} exceeded`,
                    });
                }

                if (form.ratePerMile !== null && form.ratePerMile > mileageLimitRule.maxRate) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["ratePerMile"],
                        message: `Maximum rate of ${formatCurrencyGB(mileageLimitRule.maxRate)} exceeded`,
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

                if (!flatChargeLimitRule) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["form"],
                        message:
                            "No STD flat charge limit rule is configured. Please contact an administrator.",
                    });

                    return;
                }

                if (form.flatCharge !== null && form.flatCharge > flatChargeLimitRule.maxRate) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["flatCharge"],
                        message: `Maximum flat charge of ${formatCurrencyGB(flatChargeLimitRule.maxRate)} exceeded`,
                    });
                }
            }
        });
}
