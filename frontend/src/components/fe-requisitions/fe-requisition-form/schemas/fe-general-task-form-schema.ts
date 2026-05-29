import { z } from "zod";
import { optionalIntegerInputSchema } from "./optional-integer-input-schema";
import { optionalNumberInputSchema } from "./optional-number-input-schema";


export const feGeneralTaskFormSchema =
    z.object({
        weekEndingDate:
            z.date({
                error: () => ({
                    message:
                        "Week ending date is required",
                }),
            }),

        sunday: optionalIntegerInputSchema,
        monday: optionalIntegerInputSchema,
        tuesday: optionalIntegerInputSchema,
        wednesday: optionalIntegerInputSchema,
        thursday: optionalIntegerInputSchema,
        friday: optionalIntegerInputSchema,
        saturday: optionalIntegerInputSchema,

        ratePerJob:
            optionalNumberInputSchema
                .refine(
                    (value) =>
                        value != null,

                    {
                        message:
                            "Rate per job is required",
                    },
                )
                .refine(
                    (value) =>
                        value == null ||
                        value >= 0,

                    {
                        message:
                            "Cannot be negative",
                    },
                )
    });