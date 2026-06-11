import { z } from "zod";

import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { formatCurrencyGB } from "@/lib/format/currency";

export function createFeMileageFormSchema(limitRule?: RequisitionLimitRuleSummary) {
    return z
        .object({
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

            ratePerMile: z
                .number({
                    error: "Rate per mile is required",
                })
                .nullable(),
        })
        .superRefine((form, ctx) => {
            const quantities = [
                form.quantities.sunday,
                form.quantities.monday,
                form.quantities.tuesday,
                form.quantities.wednesday,
                form.quantities.thursday,
                form.quantities.friday,
                form.quantities.saturday,
            ];

            const totalMiles = quantities.reduce<number>(
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

            if (totalMiles <= 0) {
                ctx.addIssue({
                    code: "custom",
                    path: ["form"],
                    message: "At least one mileage quantity is required",
                });
            }

            if (form.ratePerMile === null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["ratePerMile"],
                    message: "Rate per mile is required",
                });
            }

            if (!limitRule) {
                ctx.addIssue({
                    code: "custom",
                    path: ["form"],
                    message:
                        "No mileage limit rule is configured. Please contact an administrator.",
                });

                return;
            }

            for (const [day, value] of Object.entries(dayLimits)) {
                if (!value) continue;

                if (value > limitRule.maxQuantity) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["quantities", day],
                        message: `exceeds max mileage (${limitRule.maxQuantity})`,
                    });
                }
            }

            if (form.ratePerMile !== null && form.ratePerMile > limitRule.maxRate) {
                ctx.addIssue({
                    code: "custom",
                    path: ["ratePerMile"],
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