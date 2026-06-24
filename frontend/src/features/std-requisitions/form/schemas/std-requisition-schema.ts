import { z } from "zod";

export const stdRequisitionSchema = z
    .object({
        requisitionDate: z
            .date()
            .nullable()
            .refine((value) => value !== null, "Requisition date is required"),

        vanDriverId: z
            .string()
            .nullable()
            .refine((value) => value !== null, "Van driver is required"),

        vanDriverName: z
            .string()
            .nullable()
            .refine(
                (value) => Boolean(value?.trim()),
                "Van driver name is required",
            ),

        shopId: z
            .string()
            .nullable()
            .refine((value) => value !== null, "Shop is required"),

        collectionChargesBanksAndBins: z.array(z.unknown()),
        collectionVanPacks: z.array(z.unknown()),
        pickups: z.array(z.unknown()),
        transfers: z.array(z.unknown()),
        additionalCosts: z.array(z.unknown()),
    })
    .superRefine((data, ctx) => {
        const totalRows =
            data.pickups.length +
            data.transfers.length +
            data.collectionChargesBanksAndBins.length +
            data.collectionVanPacks.length +
            data.additionalCosts.length;

        if (totalRows === 0) {
            ctx.addIssue({
                code: "custom",
                path: ["form"],
                message: "At least one requisition row is required",
            });
        }
    });