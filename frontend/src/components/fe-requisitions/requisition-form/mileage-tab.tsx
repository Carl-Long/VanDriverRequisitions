"use client";

import { Plus, Trash2 } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import type { RequisitionFormData } from "@/lib/schemas/requisition";
import { RowTotal, WeekFields } from "./week-fields";
import { emptyMileage, inputClass, type FieldArrayReturn } from "./utils";

type MileageTabProps = {
    arr: FieldArrayReturn<"feMileages">;
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
    maxPerDay?: number | null;
    maxRate?: number | null;
};

export function MileageTab({
    arr,
    register,
    errors,
    maxPerDay,
    maxRate,
}: Readonly<MileageTabProps>) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Mileage</h3>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => arr.append(emptyMileage())}
                >
                    <Plus size={14} /> Add Row
                </Button>
            </div>

            {arr.fields.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
                    No mileage rows yet.
                </p>
            )}

            {arr.fields.map((f, index) => {
                const rowErrors = errors.feMileages?.[index];
                return (
                    <div
                        key={f.id}
                        className="grid gap-3 rounded-lg border border-border bg-surface p-3 md:grid-cols-[160px_1fr_120px_120px_40px] md:items-end"
                    >
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Week Ending
                            </span>
                            <input
                                type="date"
                                {...register(`feMileages.${index}.weekEndingDate`)}
                                className={inputClass(!!rowErrors?.weekEndingDate)}
                            />
                        </div>
                        <WeekFields
                            register={register}
                            pathPrefix={`feMileages.${index}`}
                            errorMessage={
                                rowErrors?.week?.message ??
                                rowErrors?.week?.root?.message
                            }
                            maxPerDay={maxPerDay}
                        />
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Rate / Mile
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                max={maxRate ?? undefined}
                                {...register(`feMileages.${index}.ratePerMile`, {
                                    valueAsNumber: true,
                                })}
                                className={inputClass(!!rowErrors?.ratePerMile)}
                            />
                            {maxRate != null && (
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Max: £{maxRate.toFixed(2)}
                                </p>
                            )}
                            {rowErrors?.ratePerMile && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.ratePerMile.message}
                                </p>
                            )}
                        </div>
                        <RowTotal
                            pathPrefix={`feMileages.${index}`}
                            rateKey="ratePerMile"
                        />
                        <button
                            type="button"
                            onClick={() => arr.remove(index)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                            aria-label="Delete row"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
