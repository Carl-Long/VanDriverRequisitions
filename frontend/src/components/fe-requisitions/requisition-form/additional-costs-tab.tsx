"use client";

import { Plus, Trash2 } from "lucide-react";
import {
    useWatch,
    type Control,
    type FieldErrors,
    type UseFormRegister,
} from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import type { FeReason } from "@/lib/api/fe-reasons";
import type { RequisitionFormData } from "@/lib/schemas/requisition";
import {
    emptyAdditionalCost,
    formatCurrency,
    inputClass,
    type FieldArrayReturn,
} from "./utils";

type AdditionalCostsTabProps = {
    arr: FieldArrayReturn<"feAdditionalCosts">;
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
    reasons: FeReason[];
    control: Control<RequisitionFormData>;
};

export function AdditionalCostsTab({
    arr,
    register,
    errors,
    reasons,
    control,
}: Readonly<AdditionalCostsTabProps>) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                    Additional Costs
                </h3>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => arr.append(emptyAdditionalCost())}
                >
                    <Plus size={14} /> Add Row
                </Button>
            </div>

            {arr.fields.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
                    No additional cost rows yet.
                </p>
            )}

            {arr.fields.map((f, index) => (
                <AdditionalCostRow
                    key={f.id}
                    index={index}
                    register={register}
                    errors={errors}
                    reasons={reasons}
                    control={control}
                    onRemove={() => arr.remove(index)}
                />
            ))}
        </div>
    );
}

type AdditionalCostRowProps = {
    index: number;
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
    reasons: FeReason[];
    control: Control<RequisitionFormData>;
    onRemove: () => void;
};

function AdditionalCostRow({
    index,
    register,
    errors,
    reasons,
    control,
    onRemove,
}: Readonly<AdditionalCostRowProps>) {
    const row = useWatch({ control, name: `feAdditionalCosts.${index}` });
    const rowErrors = errors.feAdditionalCosts?.[index];
    const isJob = row?.chargingOption === "Job";
    const computed = isJob
        ? (Number(row?.totalNumber) || 0) * (Number(row?.ratePerJob) || 0)
        : (Number(row?.miles) || 0) * (Number(row?.ratePerMile) || 0);

    return (
        <div className="space-y-3 rounded-lg border border-border bg-surface p-3">
            <div className="grid gap-3 md:grid-cols-[160px_1fr_1fr_40px] md:items-end">
                <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Week Ending
                    </span>
                    <input
                        type="date"
                        {...register(`feAdditionalCosts.${index}.weekEndingDate`)}
                        className={inputClass(!!rowErrors?.weekEndingDate)}
                    />
                </div>
                <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Reason
                    </span>
                    <select
                        {...register(`feAdditionalCosts.${index}.reasonId`)}
                        className={inputClass(!!rowErrors?.reasonId)}
                    >
                        <option value="">Select a reason…</option>
                        {reasons.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.reason}
                            </option>
                        ))}
                    </select>
                    {rowErrors?.reasonId && (
                        <p className="mt-1 text-xs text-red-500">
                            {rowErrors.reasonId.message}
                        </p>
                    )}
                </div>
                <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Charging Option
                    </span>
                    <select
                        {...register(`feAdditionalCosts.${index}.chargingOption`)}
                        className={inputClass(false)}
                    >
                        <option value="Job">Job (Quantity × Rate)</option>
                        <option value="Mileage">Mileage (Miles × Rate)</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
                    aria-label="Delete row"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px]">
                {isJob ? (
                    <JobFields
                        index={index}
                        register={register}
                        rowErrors={rowErrors}
                    />
                ) : (
                    <MileageFields
                        index={index}
                        register={register}
                        rowErrors={rowErrors}
                    />
                )}
                <div>
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        Total
                    </span>
                    <p className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-sm font-medium tabular-nums text-foreground">
                        {formatCurrency(computed)}
                    </p>
                </div>
            </div>
        </div>
    );
}

type AdditionalCostRowErrors = NonNullable<
    FieldErrors<RequisitionFormData>["feAdditionalCosts"]
>[number];

type FieldsProps = {
    index: number;
    register: UseFormRegister<RequisitionFormData>;
    rowErrors: AdditionalCostRowErrors;
};

function JobFields({ index, register, rowErrors }: Readonly<FieldsProps>) {
    return (
        <>
            <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Quantity
                </span>
                <input
                    type="number"
                    min={0}
                    {...register(`feAdditionalCosts.${index}.totalNumber`, {
                        setValueAs: (v) =>
                            v === "" || v == null ? null : Number(v),
                    })}
                    className={inputClass(!!rowErrors?.totalNumber)}
                />
                {rowErrors?.totalNumber && (
                    <p className="mt-1 text-xs text-red-500">
                        {rowErrors.totalNumber.message}
                    </p>
                )}
            </div>
            <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Rate per Job
                </span>
                <input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`feAdditionalCosts.${index}.ratePerJob`, {
                        setValueAs: (v) =>
                            v === "" || v == null ? null : Number(v),
                    })}
                    className={inputClass(!!rowErrors?.ratePerJob)}
                />
                {rowErrors?.ratePerJob && (
                    <p className="mt-1 text-xs text-red-500">
                        {rowErrors.ratePerJob.message}
                    </p>
                )}
            </div>
        </>
    );
}

function MileageFields({ index, register, rowErrors }: Readonly<FieldsProps>) {
    return (
        <>
            <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Miles
                </span>
                <input
                    type="number"
                    min={0}
                    {...register(`feAdditionalCosts.${index}.miles`, {
                        setValueAs: (v) =>
                            v === "" || v == null ? null : Number(v),
                    })}
                    className={inputClass(!!rowErrors?.miles)}
                />
                {rowErrors?.miles && (
                    <p className="mt-1 text-xs text-red-500">
                        {rowErrors.miles.message}
                    </p>
                )}
            </div>
            <div>
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Rate per Mile
                </span>
                <input
                    type="number"
                    step="0.01"
                    min={0}
                    {...register(`feAdditionalCosts.${index}.ratePerMile`, {
                        setValueAs: (v) =>
                            v === "" || v == null ? null : Number(v),
                    })}
                    className={inputClass(!!rowErrors?.ratePerMile)}
                />
                {rowErrors?.ratePerMile && (
                    <p className="mt-1 text-xs text-red-500">
                        {rowErrors.ratePerMile.message}
                    </p>
                )}
            </div>
        </>
    );
}
