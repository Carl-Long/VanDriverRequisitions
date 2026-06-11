import { optionalNumberInputSchema } from "./optional-number-input-schema";

export const optionalIntegerInputSchema =
    optionalNumberInputSchema
        .refine(
            (value) =>
                value == null ||
                Number.isInteger(
                    value,
                ),

            {
                message:
                    "Must be a whole number",
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
        );