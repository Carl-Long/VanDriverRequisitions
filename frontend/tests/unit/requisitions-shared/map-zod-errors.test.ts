import { describe, expect, it } from "vitest";
import { z } from "zod";

import { mapZodErrors } from "@/features/requisitions-shared/lib/map-zod-errors";

describe("mapZodErrors", () => {
    it("maps field and nested field errors to dot-path keys", () => {
        const schema = z.object({
            name: z.string().min(1, "Name is required."),
            address: z.object({
                postcode: z.string().min(1, "Postcode is required."),
            }),
        });

        const result = schema.safeParse({
            name: "",
            address: {
                postcode: "",
            },
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(mapZodErrors(result.error)).toEqual({
                name: "Name is required.",
                "address.postcode": "Postcode is required.",
            });
        }
    });

    it("maps form-level errors to the form key", () => {
        const schema = z.object({
            subtotal: z.number(),
        }).superRefine((value, context) => {
            if (value.subtotal <= 0) {
                context.addIssue({
                    code: "custom",
                    message: "Subtotal must be greater than zero.",
                    path: [],
                });
            }
        });

        const result = schema.safeParse({
            subtotal: 0,
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(mapZodErrors(result.error)).toEqual({
                form: "Subtotal must be greater than zero.",
            });
        }
    });

    it("keeps the last message when multiple issues target the same path", () => {
        const schema = z.object({
            code: z.string(),
        }).superRefine((_value, context) => {
            context.addIssue({
                code: "custom",
                message: "First code error.",
                path: ["code"],
            });

            context.addIssue({
                code: "custom",
                message: "Second code error.",
                path: ["code"],
            });
        });

        const result = schema.safeParse({
            code: "ABC",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(mapZodErrors(result.error)).toEqual({
                code: "Second code error.",
            });
        }
    });
});