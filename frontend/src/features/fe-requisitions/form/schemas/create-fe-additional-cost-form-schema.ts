import { z } from "zod";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { formatCurrencyGB } from "@/lib/format/currency";
import { MIN_MONEY_AMOUNT, hasMaxTwoDecimalPlaces } from "@/lib/validation/money";

type Params = {
    additionalCostLimitRule?: RequisitionLimitRuleSummary;
    mileageLimitRule?: RequisitionLimitRuleSummary;
};

export function createFeAdditionalCostFormSchema({
    additionalCostLimitRule,
    mileageLimitRule,
}: Params) {
    return z
        .object({
            weekEndingDate: z.date({
                error: "Week ending date is required",
            }),

            reasonId: z
                .string()
                .nullable()
                .refine((x) => x !== null, "Reason is required"),

            reasonCode: z.string().nullable(),
            isReasonActive: z.boolean(),

            reasonText: z.string().nullable(),

            chargingOption: z.enum(["Job", "Mileage"]),

            totalNumber: z.number().int("Must be a whole number").min(0).nullable(),
            ratePerJob: z
                .number()
                .min(MIN_MONEY_AMOUNT, "Rate per job must be at least £0.01")
                .refine(
                    hasMaxTwoDecimalPlaces,
                    "Rate per job can have a maximum of 2 decimal places",
                )
                .nullable(),

            miles: z.number().int("Must be a whole number").min(0).nullable(),
            ratePerMile: z
                .number()
                .min(MIN_MONEY_AMOUNT, "Rate per mile must be at least £0.01")
                .refine(
                    hasMaxTwoDecimalPlaces,
                    "Rate per mile can have a maximum of 2 decimal places",
                )
                .nullable(),
        })
        .superRefine((form, ctx) => {
            if (form.chargingOption === "Job") {
                if (form.totalNumber === null || form.totalNumber <= 0) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["totalNumber"],
                        message: "Total number is required",
                    });
                }

                if (form.ratePerJob === null) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["ratePerJob"],
                        message: "Rate per job is required",
                    });
                }

                if (form.miles !== null || form.ratePerMile !== null) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["form"],
                        message: "Mileage fields must be empty for job-based additional costs",
                    });
                }

                if (!additionalCostLimitRule) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["form"],
                        message:
                            "No additional cost limit rule is configured. Please contact an administrator.",
                    });

                    return;
                }

                if (
                    form.totalNumber !== null &&
                    form.totalNumber > additionalCostLimitRule.maxQuantity
                ) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["totalNumber"],
                        message: `Maximum quantity of ${additionalCostLimitRule.maxQuantity} exceeded`,
                    });
                }

                if (
                    form.ratePerJob !== null &&
                    form.ratePerJob > additionalCostLimitRule.maxRate
                ) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["ratePerJob"],
                        message: `Maximum rate of ${formatCurrencyGB(
                            additionalCostLimitRule.maxRate,
                        )} exceeded`,
                    });
                }
            }

            if (form.chargingOption === "Mileage") {
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

                if (form.totalNumber !== null || form.ratePerJob !== null) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["form"],
                        message: "Job fields must be empty for mileage-based additional costs",
                    });
                }

                if (!mileageLimitRule) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["form"],
                        message:
                            "No mileage limit rule is configured. Please contact an administrator.",
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

                if (
                    form.ratePerMile !== null &&
                    form.ratePerMile > mileageLimitRule.maxRate
                ) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["ratePerMile"],
                        message: `Maximum rate of ${formatCurrencyGB(
                            mileageLimitRule.maxRate,
                        )} exceeded`,
                    });
                }
            }
        });
}