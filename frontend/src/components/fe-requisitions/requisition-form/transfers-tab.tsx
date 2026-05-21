"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
    FieldErrors,
    UseFormGetValues,
    UseFormRegister,
    UseFormSetValue,
} from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import type { ShopLookup } from "@/lib/api/shops";
import type { RequisitionFormData } from "@/lib/schemas/requisition";
import { RowTotal, WeekFields } from "./week-fields";
import { emptyTransfer, inputClass, type FieldArrayReturn } from "./utils";

type TransfersTabProps = {
    arr: FieldArrayReturn<"feTransfers">;
    register: UseFormRegister<RequisitionFormData>;
    errors: FieldErrors<RequisitionFormData>;
    setValue: UseFormSetValue<RequisitionFormData>;
    getValues: UseFormGetValues<RequisitionFormData>;
    shopCache: Record<string, ShopLookup>;
    setShopCache: (next: Record<string, ShopLookup>) => void;
    fetchShops: (search: string) => Promise<ComboboxOption<ShopLookup>[]>;
    maxPerDay?: number | null;
    maxRate?: number | null;
};

export function TransfersTab({
    arr,
    register,
    errors,
    setValue,
    getValues,
    shopCache,
    setShopCache,
    fetchShops,
    maxPerDay,
    maxRate,
}: Readonly<TransfersTabProps>) {
    function setShop(
        index: number,
        side: "From" | "To",
        value: string | null,
        data: ShopLookup | null,
    ) {
        const field = side === "From" ? "shopIdFrom" : "shopIdTo";
        setValue(`feTransfers.${index}.${field}`, value ?? "", {
            shouldValidate: true,
        });
        if (data) setShopCache({ ...shopCache, [data.id]: data });
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Transfers</h3>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => arr.append(emptyTransfer())}
                >
                    <Plus size={14} /> Add Row
                </Button>
            </div>

            {arr.fields.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
                    No transfer rows yet.
                </p>
            )}

            {arr.fields.map((f, index) => {
                const rowErrors = errors.feTransfers?.[index];
                const values = getValues().feTransfers[index];
                const fromShop = values?.shopIdFrom
                    ? shopCache[values.shopIdFrom]
                    : null;
                const toShop = values?.shopIdTo ? shopCache[values.shopIdTo] : null;
                return (
                    <div
                        key={f.id}
                        className="grid gap-3 rounded-lg border border-border bg-surface p-3 md:grid-cols-[140px_1fr_1fr_1fr_120px_120px_40px] md:items-end"
                    >
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Week Ending
                            </span>
                            <input
                                type="date"
                                {...register(`feTransfers.${index}.weekEndingDate`)}
                                className={inputClass(!!rowErrors?.weekEndingDate)}
                            />
                        </div>
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                From Shop
                            </span>
                            <Combobox<ShopLookup>
                                value={values?.shopIdFrom || null}
                                selectedLabel={
                                    fromShop
                                        ? `${fromShop.code} — ${fromShop.name}`
                                        : null
                                }
                                invalid={!!rowErrors?.shopIdFrom}
                                onChange={(v, d) => setShop(index, "From", v, d)}
                                fetchOptions={fetchShops}
                            />
                            {rowErrors?.shopIdFrom && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.shopIdFrom.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                To Shop
                            </span>
                            <Combobox<ShopLookup>
                                value={values?.shopIdTo || null}
                                selectedLabel={
                                    toShop ? `${toShop.code} — ${toShop.name}` : null
                                }
                                invalid={!!rowErrors?.shopIdTo}
                                onChange={(v, d) => setShop(index, "To", v, d)}
                                fetchOptions={fetchShops}
                            />
                            {rowErrors?.shopIdTo && (
                                <p className="mt-1 text-xs text-red-500">
                                    {rowErrors.shopIdTo.message}
                                </p>
                            )}
                        </div>
                        <WeekFields
                            register={register}
                            pathPrefix={`feTransfers.${index}`}
                            errorMessage={
                                rowErrors?.week?.message ??
                                rowErrors?.week?.root?.message
                            }
                            maxPerDay={maxPerDay}
                        />
                        <div>
                            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                                Rate / Job
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                max={maxRate ?? undefined}
                                {...register(`feTransfers.${index}.ratePerJob`, {
                                    valueAsNumber: true,
                                })}
                                className={inputClass(!!rowErrors?.ratePerJob)}
                            />
                        </div>
                        <RowTotal
                            pathPrefix={`feTransfers.${index}`}
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
