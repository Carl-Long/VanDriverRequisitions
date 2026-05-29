import { z } from "zod";

export const optionalNumberInputSchema =
    z.preprocess(
        (value) => {
            if (
                value === "" ||
                value == null
            ) {
                return undefined;
            }

            return Number(value);
        },

        z.number({
            error: () => ({
                message:
                    "Must be a number",
            }),
        }),
    )
        .refine(
            (value) =>
                !Number.isNaN(value),

            {
                message:
                    "Must be a number",
            },
        )
        .optional();

