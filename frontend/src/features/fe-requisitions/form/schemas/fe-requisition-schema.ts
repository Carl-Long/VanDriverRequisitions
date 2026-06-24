import { z } from "zod";

export const feRequisitionSchema = z
    .object({
        requisitionDate: z.date({
            error: "Requisition date is required",
        }),

        vanDriverId: z
            .string()
            .nullable()
            .refine((x) => x !== null, "81 code is required"),

        vanDriverName: z.string().trim().min(1, "Van driver name is required"),

        shopId: z
            .string()
            .nullable()
            .refine((x) => x !== null, "Shop is required"),

        feGeneralTasks: z.array(z.unknown()),
        feMileages: z.array(z.unknown()),
        feTransfers: z.array(z.unknown()),
        feAdditionalCosts: z.array(z.unknown()),
    })
    .superRefine((data, ctx) => {
        const hasAnyRows =
            data.feGeneralTasks.length > 0 ||
            data.feMileages.length > 0 ||
            data.feTransfers.length > 0 ||
            data.feAdditionalCosts.length > 0;

        if (!hasAnyRows) {
            ctx.addIssue({
                code: "custom",
                path: ["form"],
                message: "At least one requisition row is required",
            });
        }
    });
