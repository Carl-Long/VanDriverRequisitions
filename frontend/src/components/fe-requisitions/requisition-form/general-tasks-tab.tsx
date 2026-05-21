"use client";

import { Plus, Trash2 } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import type { FeTaskType } from "@/lib/api/fe-task-types";
import type { RequisitionFormData } from "@/lib/schemas/requisition";
import { RowTotal, WeekFields } from "./week-fields";
import { emptyGeneralTask, inputClass, type FieldArrayReturn } from "./utils";

type GeneralTasksTabProps = {
    taskType: FeTaskType;
    arr: FieldArrayReturn<"feGeneralTasks">;
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
};

export function GeneralTasksTab({
    taskType,
    arr,
    register,
    errors,
}: Readonly<GeneralTasksTabProps>) {
    const allFields = arr.fields;
    const indexes = allFields
        .map((f, i) => ({ f, i }))
        .filter(({ f }) => f.feTaskTypeId === taskType.id)
        .map(({ i }) => i);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                    {taskType.name} ({taskType.code})
                </h3>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => arr.append(emptyGeneralTask(taskType.id))}
                >
                    <Plus size={14} />
                    Add Row
                </Button>
            </div>

            {indexes.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
                    No rows yet. Click <strong>Add Row</strong> to record{" "}
                    {taskType.name}.
                </p>
            )}

            {indexes.map((index) => {
                const rowErrors = errors.feGeneralTasks?.[index];
                return (
                    <div
                        key={allFields[index].id}
                        className="grid gap-3 rounded-lg border border-border bg-surface p-3 md:grid-cols-[160px_1fr_120px_120px_40px] md:items-end"
                    >
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Week Ending
                            </span>
                            <input
                                type="date"
                                {...register(
                                    `feGeneralTasks.${index}.weekEndingDate`,
                                )}
                                className={inputClass(!!rowErrors?.weekEndingDate)}
                            />
                        </div>
                        <WeekFields
                            register={register}
                            pathPrefix={`feGeneralTasks.${index}`}
                            errorMessage={
                                rowErrors?.week?.message ??
                                rowErrors?.week?.root?.message
                            }
                            maxPerDay={taskType.dailyQuantityMax}
                        />
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Rate / Job
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                max={taskType.rateMax ?? undefined}
                                {...register(`feGeneralTasks.${index}.ratePerJob`, {
                                    valueAsNumber: true,
                                })}
                                className={inputClass(!!rowErrors?.ratePerJob)}
                            />
                            {taskType.rateMax != null && (
                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                    Max: £{taskType.rateMax.toFixed(2)}
                                </p>
                            )}
                            {rowErrors?.ratePerJob && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.ratePerJob.message}
                                </p>
                            )}
                        </div>
                        <RowTotal
                            pathPrefix={`feGeneralTasks.${index}`}
                            rateKey="ratePerJob"
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
