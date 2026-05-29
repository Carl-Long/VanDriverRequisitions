import { z } from "zod";
import { optionalIntegerInputSchema } from "./optional-integer-input-schema";
import { optionalNumberInputSchema } from "./optional-number-input-schema";


export const feGeneralTaskFormSchema =
    z.object({
        weekEndingDate:
            z.date().optional(),

        sunday:
            optionalIntegerInputSchema,

        monday:
            optionalIntegerInputSchema,

        tuesday:
            optionalIntegerInputSchema,

        wednesday:
            optionalIntegerInputSchema,

        thursday:
            optionalIntegerInputSchema,

        friday:
            optionalIntegerInputSchema,

        saturday:
            optionalIntegerInputSchema,

        ratePerJob:
            optionalNumberInputSchema,
    })
        .superRefine((data, ctx) => {
            if (
                !data.weekEndingDate
            ) {
                ctx.addIssue({
                    code: "custom",

                    path: [
                        "weekEndingDate",
                    ],

                    message:
                        "Week ending date is required",
                });
            }

            if (
                data.ratePerJob ==
                null
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

            const totalJobs =
                (data.sunday ?? 0)
                + (data.monday ?? 0)
                + (data.tuesday ?? 0)
                + (data.wednesday ?? 0)
                + (data.thursday ?? 0)
                + (data.friday ?? 0)
                + (data.saturday ?? 0);

            if (
                totalJobs <= 0
            ) {
                ctx.addIssue({
                    code: "custom",

                    path: ["form"],

                    message:
                        "Please enter at least one daily quantity",
                });
            }
        });

export type FeGeneralTaskForm =
    z.infer<
        typeof feGeneralTaskFormSchema
    >;