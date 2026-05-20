"use client";

import { useWatch, type UseFormRegister } from "react-hook-form";
import type { RequisitionFormData } from "@/lib/schemas/requisition";
import { DAYS, DAY_LABELS, formatCurrency, weekTotal } from "./utils";

type WeekFieldsProps = {
    register: UseFormRegister<RequisitionFormData>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pathPrefix: any;
    errorMessage?: string;
    maxPerDay?: number | null;
};

export function WeekFields({
    register,
    pathPrefix,
    errorMessage,
    maxPerDay,
}: Readonly<WeekFieldsProps>) {
    return (
        <div>
            <div className="grid grid-cols-7 gap-1.5">
                {DAYS.map((d, i) => (
                    <div key={d}>
                        <label className="mb-0.5 block text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            {DAY_LABELS[i]}
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={maxPerDay ?? undefined}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            {...register(`${pathPrefix}.week.${d}` as any, {
                                setValueAs: (v) =>
                                    v === "" || v == null ? null : Number(v),
                            })}
                            className="w-full rounded border border-border bg-surface px-1.5 py-1 text-center text-sm tabular-nums focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-ring/20"
                            placeholder="0"
                        />
                    </div>
                ))}
            </div>
            {maxPerDay != null && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Max per day: {maxPerDay}
                </p>
            )}
            {errorMessage && (
                <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
            )}
        </div>
    );
}

type RowTotalProps = {
    pathPrefix: string;
    rateKey: "ratePerJob" | "ratePerMile";
};

export function RowTotal({ pathPrefix, rateKey }: Readonly<RowTotalProps>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const week = useWatch({ name: `${pathPrefix}.week` as any });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rate = useWatch({ name: `${pathPrefix}.${rateKey}` as any });
    const total =
        week && typeof week === "object"
            ? weekTotal(week as Parameters<typeof weekTotal>[0]) *
            (Number(rate) || 0)
            : 0;
    return (
        <div>
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Total
            </span>
            <p className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-sm font-medium tabular-nums text-foreground">
                {formatCurrency(total)}
            </p>
        </div>
    );
}
