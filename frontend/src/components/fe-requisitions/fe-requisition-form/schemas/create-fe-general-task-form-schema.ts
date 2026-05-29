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
