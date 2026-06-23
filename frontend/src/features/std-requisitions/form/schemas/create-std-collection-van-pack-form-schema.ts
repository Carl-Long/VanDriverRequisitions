import { z } from "zod";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { isUkPostcodeOutwardCode } from "@/lib/validation/uk-postcode";

export function createStdCollectionVanPackFormSchema(
    vanPackLimitRule?: RequisitionLimitRuleSummary,
) {
    return z
        .object({
            deliveryDate: z
                .date()
                .nullable()
                .refine((value) => value !== null, "Delivery date is required"),

            postCodeZone: z
                .string()
                .trim()
                .min(1, "Postcode zone is required")
                .refine(
                    (value) => isUkPostcodeOutwardCode(value),
                    "Enter a valid postcode zone, for example M1, B33 or SW1A",
                ),

            vanPacksOut: z
                .number()
                .int("Must be a whole number")
                .min(1, "Van packs out must be greater than zero")
                .nullable(),

            filledBags: z
                .number()
                .int("Must be a whole number")
                .min(1, "Filled bags must be greater than zero")
                .nullable(),
        })
        .superRefine((form, ctx) => {
            if (!vanPackLimitRule) {
                ctx.addIssue({
                    code: "custom",
                    path: ["form"],
                    message:
                        "No STD van pack pricing rule is configured. Please contact an administrator.",
                });

                return;
            }

            if (form.vanPacksOut === null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["vanPacksOut"],
                    message: "Van packs out is required",
                });
            }

            if (form.filledBags === null) {
                ctx.addIssue({
                    code: "custom",
                    path: ["filledBags"],
                    message: "Filled bags is required",
                });
            }

            if (
                form.vanPacksOut !== null &&
                form.vanPacksOut > vanPackLimitRule.maxQuantity
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["vanPacksOut"],
                    message: `Maximum van packs out of ${vanPackLimitRule.maxQuantity} exceeded`,
                });
            }

            if (
                form.filledBags !== null &&
                form.vanPacksOut !== null &&
                form.filledBags > form.vanPacksOut
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["filledBags"],
                    message: "Filled bags cannot be greater than van packs out",
                });
            }
        });
}