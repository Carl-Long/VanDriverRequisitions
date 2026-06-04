import { z } from "zod";

const weekSchema = z.object({
    sunday: z.coerce.number().int().min(0).nullable(),
    monday: z.coerce.number().int().min(0).nullable(),
    tuesday: z.coerce.number().int().min(0).nullable(),
    wednesday: z.coerce.number().int().min(0).nullable(),
    thursday: z.coerce.number().int().min(0).nullable(),
    friday: z.coerce.number().int().min(0).nullable(),
    saturday: z.coerce.number().int().min(0).nullable(),
});

function weekTotal(w: z.infer<typeof weekSchema>): number {
    return (
        (w.sunday ?? 0) +
        (w.monday ?? 0) +
        (w.tuesday ?? 0) +
        (w.wednesday ?? 0) +
        (w.thursday ?? 0) +
        (w.friday ?? 0) +
        (w.saturday ?? 0)
    );
}

export const generalTaskRowSchema = z.object({
    id: z.string().nullable().optional(),
    feTaskTypeId: z.uuid("Task type is required."),
    weekEndingDate: z.string().min(1, "Week ending date is required."),
    week: weekSchema.refine((w) => weekTotal(w) > 0, {
        message: "At least one day must have a quantity.",
    }),
    ratePerJob: z.coerce
        .number({ message: "Rate per job is required." })
        .min(0, "Rate must be zero or positive."),
});

export const mileageRowSchema = z.object({
    id: z.string().nullable().optional(),
    weekEndingDate: z.string().min(1, "Week ending date is required."),
    week: weekSchema.refine((w) => weekTotal(w) > 0, {
        message: "At least one day must have miles.",
    }),
    ratePerMile: z.coerce
        .number({ message: "Rate per mile is required." })
        .min(0, "Rate must be zero or positive."),
});

export const transferRowSchema = z
    .object({
        id: z.string().nullable().optional(),
        weekEndingDate: z.string().min(1, "Week ending date is required."),
        shopIdFrom: z.uuid("From shop is required."),
        shopIdTo: z.uuid("To shop is required."),
        week: weekSchema.refine((w) => weekTotal(w) > 0, {
            message: "At least one day must have a quantity.",
        }),
        ratePerJob: z.coerce
            .number({ message: "Rate per job is required." })
            .min(0, "Rate must be zero or positive."),
    })
    .refine((d) => d.shopIdFrom !== d.shopIdTo, {
        message: "From and To shops must be different.",
        path: ["shopIdTo"],
    });

export const additionalCostRowSchema = z
    .object({
        id: z.string().nullable().optional(),
        weekEndingDate: z.string().min(1, "Week ending date is required."),
        reasonId: z.uuid("Reason is required."),
        chargingOption: z.enum(["Job", "Mileage"]),
        totalNumber: z.coerce.number().min(0).nullable(),
        ratePerJob: z.coerce.number().min(0).nullable(),
        miles: z.coerce.number().min(0).nullable(),
        ratePerMile: z.coerce.number().min(0).nullable(),
    })
    .superRefine((d, ctx) => {
        if (d.chargingOption === "Job") {
            if (d.totalNumber === null || d.totalNumber <= 0)
                ctx.addIssue({
                    code: "custom",
                    path: ["totalNumber"],
                    message: "Number of jobs is required.",
                });
            if (d.ratePerJob === null)
                ctx.addIssue({
                    code: "custom",
                    path: ["ratePerJob"],
                    message: "Rate per job is required.",
                });
        } else {
            if (d.miles === null || d.miles <= 0)
                ctx.addIssue({
                    code: "custom",
                    path: ["miles"],
                    message: "Miles are required.",
                });
            if (d.ratePerMile === null)
                ctx.addIssue({
                    code: "custom",
                    path: ["ratePerMile"],
                    message: "Rate per mile is required.",
                });
        }
    });

export const requisitionFormSchema = z.object({
    requisitionDate: z.string().min(1, "Submission date is required."),
    vanDriverId: z.uuid("Van driver is required."),
    vanDriverName: z.string().min(1, "Driver name is required.").max(200),
    shopId: z.uuid("Shop is required."),
    isVatApplicable: z.boolean(),
    poNumber: z.string().nullable(),
    feGeneralTasks: z.array(generalTaskRowSchema),
    feMileages: z.array(mileageRowSchema),
    feTransfers: z.array(transferRowSchema),
    feAdditionalCosts: z.array(additionalCostRowSchema),
});

export type RequisitionFormData = z.infer<typeof requisitionFormSchema>;
export type GeneralTaskRow = z.infer<typeof generalTaskRowSchema>;
export type MileageRow = z.infer<typeof mileageRowSchema>;
export type TransferRow = z.infer<typeof transferRowSchema>;
export type AdditionalCostRow = z.infer<typeof additionalCostRowSchema>;
