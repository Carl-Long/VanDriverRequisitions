import { z } from "zod";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { formatCurrencyGB } from "@/lib/format/currency";
import { MIN_MONEY_AMOUNT, hasMaxTwoDecimalPlaces } from "@/lib/validation/money";

export function createFeTransferFormSchema(limitRule?: RequisitionLimitRuleSummary) {
    return z
        .object({
            shopIdFrom: z
                .string()
                .nullable()
                .refine((x) => x !== null, "From shop is required"),

            shopLabelFrom: z.string().nullable(),
            isShopFromActive: z.boolean(),

            shopIdTo: z
                .string()
                .nullable()
                .refine((x) => x !== null, "To shop is required"),

            shopLabelTo: z.string().nullable(),
            isShopToActive: z.boolean(),

            weekEndingDate: z.date({
                error: "Week ending date is required",
            }),

            quantities: z.object({
                sunday: quantitySchema,
                monday: quantitySchema,
                tuesday: quantitySchema,
                wednesday: quantitySchema,
                thursday: quantitySchema,
                friday: quantitySchema,
                saturday: quantitySchema,
            }),

            ratePerJob: z
                .number()
                .min(MIN_MONEY_AMOUNT, "Rate per job must be at least £0.01")
                .refine(
                    hasMaxTwoDecimalPlaces,
                    "Rate per job can have a maximum of 2 decimal places",
                )
                .nullable(),
        })
        .superRefine((form, ctx) => {
            if (
                form.shopIdFrom !== null &&
                form.shopIdTo !== null &&
                form.shopIdFrom === form.shopIdTo
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["shopIdTo"],
                    message: "From shop and to shop must be different",
                });
            }

            const quantities = [
                form.quantities.sunday,
                form.quantities.monday,
                form.quantities.tuesday,
                form.quantities.wednesday,
                form.quantities.thursday,
                form.quantities.friday,
                form.quantities.saturday,
            ];

            const totalQuantity = quantities.reduce<number>(
                (sum, value) => sum + (value ?? 0),
                0,
            );

            const dayLimits = {
                sunday: form.quantities.sunday,
                monday: form.quantities.monday,
                tuesday: form.quantities.tuesday,
                wednesday: form.quantities.wednesday,
                thursday: form.quantities.thursday,
                friday: form.quantities.friday,
                saturday: form.quantities.saturday,
            };

            if (totalQuantity <= 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["form"],
                    message: "At least one transfer quantity is required",
                });
            }

            if (form.ratePerJob === null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["ratePerJob"],
                    message: "Rate per job is required",
                });
            }

            if (!limitRule) {
                ctx.addIssue({
                    code: "custom",
                    path: ["form"],
                    message:
                        "No transfer limit rule is configured. Please contact an administrator.",
                });

                return;
            }

            for (const [day, value] of Object.entries(dayLimits)) {
                if (!value) continue;

                if (value > limitRule.maxQuantity) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["quantities", day],
                        message: `exceeds max quantity (${limitRule.maxQuantity})`,
                    });
                }
            }

            if (form.ratePerJob !== null && form.ratePerJob > limitRule.maxRate) {
                ctx.addIssue({
                    code: "custom",
                    path: ["ratePerJob"],
                    message: `Maximum rate of ${formatCurrencyGB(limitRule.maxRate)} exceeded`,
                });
            }
        });
}

const quantitySchema = z
    .number()
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .nullable();