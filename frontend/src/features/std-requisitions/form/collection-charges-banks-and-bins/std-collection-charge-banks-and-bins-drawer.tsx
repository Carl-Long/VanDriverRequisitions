"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { DatePicker } from "@/components/ui/date/date-picker";
import { AppDrawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { formatCurrencyGB } from "@/lib/format/currency";

import { calculateStdCollectionChargeBanksAndBinsFormTotal } from "../lib/calculate-std-collection-charge-banks-and-bins-form";
import { createEmptyStdCollectionChargeBanksAndBinsForm } from "../lib/create-empty-std-collection-charge-banks-and-bins-form";
import { createStdCollectionChargeBanksAndBinsFormSchema } from "../schemas/create-std-collection-charge-banks-and-bins-form-schema";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import { mapZodErrors } from "@/features/fe-requisitions/form/lib/map-zod-errors";
import { StdCollectionTypeField } from "@/features/std-collection-types/std-collection-type-field";
import { StdLocationField } from "@/features/std-locations/std-location-field";
import { StdChargeType, STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";

type Props = {
    open: boolean;
    title: string;
    shopId: string | null;
    initialValues?: StdCollectionChargeBanksAndBinsForm;
    onClose: () => void;
    onSave: (form: StdCollectionChargeBanksAndBinsForm) => void;
};

type SubmitIntent = "close" | "add-another";

export function StdCollectionChargeBanksAndBinsDrawer({
    open,
    title,
    shopId,
    initialValues,
    onClose,
    onSave,
}: Readonly<Props>) {
    const [form, setForm] = useState<StdCollectionChargeBanksAndBinsForm>(
        createEmptyStdCollectionChargeBanksAndBinsForm(),
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    const schema = createStdCollectionChargeBanksAndBinsFormSchema();
    const isEditMode = initialValues !== undefined;

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm(initialValues ?? createEmptyStdCollectionChargeBanksAndBinsForm());
        setErrors({});
    }, [open, initialValues]);

    const totalValue = useMemo(
        () => calculateStdCollectionChargeBanksAndBinsFormTotal(form),
        [form],
    );

    function saveForm(intent: SubmitIntent) {
        const result = schema.safeParse(form);

        if (!result.success) {
            setErrors(mapZodErrors(result.error));
            return;
        }

        setErrors({});
        onSave(result.data);

        if (intent === "close") {
            onClose();
            return;
        }

        setForm(createEmptyStdCollectionChargeBanksAndBinsForm(result.data.date));
    }

    function clearError(field: string) {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    function setChargeType(chargeType: StdChargeType) {
        setForm((prev) => ({
            ...prev,
            chargeType,
            miles: chargeType === STD_CHARGE_TYPE.Mileage ? prev.miles : null,
            ratePerMile: chargeType === STD_CHARGE_TYPE.Mileage ? prev.ratePerMile : null,
            flatCharge: chargeType === STD_CHARGE_TYPE.FlatCharge ? prev.flatCharge : null,
        }));

        setErrors({});
    }

    if (!open) {
        return null;
    }

    return (
        <AppDrawer
            open={open}
            title={title}
            onClose={onClose}
            footer={
                <div className="flex items-center justify-between">
                    <Button type="button" tone="accent" onClick={onClose}>
                        Cancel
                    </Button>

                    <div className="flex items-center gap-4">
                        <Button
                            type="button"
                            className="min-w-[160px]"
                            variant="outline"
                            onClick={() => saveForm("close")}
                        >
                            {isEditMode ? "Update & Close" : "Add & Close"}
                        </Button>

                        {!isEditMode && (
                            <Button
                                form="std-banks-bins-drawer-form"
                                type="submit"
                                className="min-w-[180px]"
                            >
                                <Plus className="h-4 w-4" />
                                Add & Create Another
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <form
                id="std-banks-bins-drawer-form"
                className="space-y-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    saveForm(isEditMode ? "close" : "add-another");
                }}
            >
                {!shopId && (
                    <Alert tone="warning">
                        Select a shop on the Details tab before adding Banks & Bins rows.
                    </Alert>
                )}

                <Field label="Date" required error={errors.date}>
                    <DatePicker
                        value={form.date ?? undefined}
                        state={errors.date ? "error" : "default"}
                        onChange={(date) => {
                            setForm((prev) => ({
                                ...prev,
                                date: date ?? null,
                            }));

                            clearError("date");
                        }}
                    />
                </Field>

                <StdCollectionTypeField
                    required
                    value={form.collectionTypeId}
                    label={form.collectionTypeLabel}
                    error={errors.collectionTypeId}
                    onChange={(value, label, collectionType) => {
                        setForm((prev) => ({
                            ...prev,
                            collectionTypeId: value,
                            collectionTypeLabel: collectionType?.name ?? label,
                            collectionTypeCode: collectionType?.code ?? null,

                            // Locations depend on collection type.
                            locationId: null,
                            locationLabel: null,
                            locationPostCode: null,
                        }));

                        clearError("collectionTypeId");
                        clearError("locationId");
                        clearError("form");
                    }}
                />

                <StdLocationField
                    required
                    shopId={shopId}
                    collectionTypeId={form.collectionTypeId}
                    value={form.locationId}
                    label={form.locationLabel}
                    error={errors.locationId}
                    onChange={(value, label, location) => {
                        setForm((prev) => ({
                            ...prev,
                            locationId: value,
                            locationLabel: location?.locationName ?? label,
                            locationPostCode: location?.postCode ?? null,
                        }));

                        clearError("locationId");
                        clearError("form");
                    }}
                />

                <Field label="Number of Bags" error={errors.numberOfBags}>
                    <Input
                        type="number"
                        min={0}
                        value={form.numberOfBags ?? ""}
                        state={errors.numberOfBags ? "error" : "default"}
                        onChange={(event) => {
                            const value = event.target.value;

                            setForm((prev) => ({
                                ...prev,
                                numberOfBags: value === "" ? null : Number(value),
                            }));

                            clearError("numberOfBags");
                        }}
                    />
                </Field>

                <Field label="Charge Type" required error={errors.chargeType}>
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant={form.chargeType === STD_CHARGE_TYPE.Mileage ? "solid" : "outline"}
                            onClick={() => setChargeType(STD_CHARGE_TYPE.Mileage)}
                        >
                            Mileage
                        </Button>

                        <Button
                            type="button"
                            variant={form.chargeType === STD_CHARGE_TYPE.FlatCharge ? "solid" : "outline"}
                            onClick={() => setChargeType(STD_CHARGE_TYPE.FlatCharge)}
                        >
                            Flat charge
                        </Button>
                    </div>
                </Field>

                {form.chargeType === STD_CHARGE_TYPE.Mileage ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Miles" required error={errors.miles}>
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                value={form.miles ?? ""}
                                state={errors.miles ? "error" : "default"}
                                onChange={(event) => {
                                    const value = event.target.value;

                                    setForm((prev) => ({
                                        ...prev,
                                        miles: value === "" ? null : Number(value),
                                    }));

                                    clearError("miles");
                                    clearError("form");
                                }}
                            />
                        </Field>

                        <Field label="Rate Per Mile" required error={errors.ratePerMile}>
                            <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.ratePerMile ?? ""}
                                state={errors.ratePerMile ? "error" : "default"}
                                onChange={(event) => {
                                    const value = event.target.value;

                                    setForm((prev) => ({
                                        ...prev,
                                        ratePerMile: value === "" ? null : Number(value),
                                    }));

                                    clearError("ratePerMile");
                                    clearError("form");
                                }}
                            />
                        </Field>
                    </div>
                ) : (
                    <Field label="Flat Charge" required error={errors.flatCharge}>
                        <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.flatCharge ?? ""}
                            state={errors.flatCharge ? "error" : "default"}
                            onChange={(event) => {
                                const value = event.target.value;

                                setForm((prev) => ({
                                    ...prev,
                                    flatCharge: value === "" ? null : Number(value),
                                }));

                                clearError("flatCharge");
                                clearError("form");
                            }}
                        />
                    </Field>
                )}

                {errors.form && <Alert tone="danger">{errors.form}</Alert>}

                <div className="rounded-2xl border border-border bg-surface-subtle p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Value</span>

                        <span className="font-medium">{formatCurrencyGB(totalValue)}</span>
                    </div>
                </div>
            </form>
        </AppDrawer>
    );
}