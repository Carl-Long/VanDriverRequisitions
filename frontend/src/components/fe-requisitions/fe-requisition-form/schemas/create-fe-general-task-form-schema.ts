import { z } from "zod";

import type {
    RequisitionLimitRuleSummary,
} from "@/lib/api/requisition-limit-rules";

export function createFeGeneralTaskFormSchema(
    limitRule?: RequisitionLimitRuleSummary,
) {
    return z
        .object({
            weekEndingDate:
                z.date({
                    error:
                        "Week ending date is required",
                }),

            quantities:
                z.object({
                    sunday:
                        z.number()
                            .nullable(),

                    monday:
                        z.number()
                            .nullable(),

                    tuesday:
                        z.number()
                            .nullable(),

                    wednesday:
                        z.number()
                            .nullable(),

                    thursday:
                        z.number()
                            .nullable(),

                    friday:
                        z.number()
                            .nullable(),

                    saturday:
                        z.number()
                            .nullable(),
                }),

            ratePerJob:
                z
                    .number({
                        error:
                            "Rate per job is required",
                    })
                    .nullable(),
        })

        .superRefine(
            (form, ctx) => {

                const quantities = [
                    form.quantities.sunday,
                    form.quantities.monday,
                    form.quantities.tuesday,
                    form.quantities.wednesday,
                    form.quantities.thursday,
                    form.quantities.friday,
                    form.quantities.saturday,
                ];

                const totalQuantity =
                    quantities.reduce<number>(
                        (sum, value) =>
                            sum + (value ?? 0),

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

                //
                // REQUIRE AT LEAST ONE JOB
                //
                if (
                    totalQuantity <= 0
                ) {
                    ctx.addIssue({
                        code: "custom",

                        path: ["form"],

                        message:
                            "At least one job quantity is required",
                    });
                }

                //
                // REQUIRE RATE
                //
                if (
                    form.ratePerJob === null
                ) {
                    ctx.addIssue({
                        code: "custom",

                        path: [
                            "ratePerJob",
                        ],

                        message:
                            "Rate per job is required",
                    });
                }

                //
                // LIMIT VALIDATION
                //
                if (!limitRule) {
                    return;
                }

                if (
                    totalQuantity >
                    limitRule.maxQuantity
                ) {
                    ctx.addIssue({
                        code: "custom",

                        path: ["form"],

                        message:
                            `Maximum quantity of ${limitRule.maxQuantity} exceeded`,
                    });
                }

                if (
                    form.ratePerJob !==
                    null &&
                    form.ratePerJob >
                    limitRule.maxRate
                ) {
                    ctx.addIssue({
                        code: "custom",

                        path: [
                            "ratePerJob",
                        ],

                        message:
                            `Maximum rate of £${limitRule.maxRate.toFixed(2)} exceeded`,
                    });
                }
            },
        );
}
