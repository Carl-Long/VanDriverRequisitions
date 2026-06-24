"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date/date-picker";
import { AppDrawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";

import { calculateStdCollectionChargeBanksAndBinsFormTotal } from "../lib/calculate-std-collection-charge-banks-and-bins-form";
import { createEmptyStdCollectionChargeBanksAndBinsForm } from "../lib/create-empty-std-collection-charge-banks-and-bins-form";
import { createStdCollectionChargeBanksAndBinsFormSchema } from "../schemas/create-std-collection-charge-banks-and-bins-form-schema";
import type { StdCollectionChargeBanksAndBinsForm } from "../types/std-collection-charge-banks-and-bins-form";
import { mapZodErrors } from "@/features/requisitions-shared/lib/map-zod-errors";
import { StdCollectionTypeField } from "@/features/std-collection-types/std-collection-type-field";
import { StdLocationField } from "@/features/std-locations/std-location-field";
import { STD_CHARGE_TYPE } from "../../constants/std-charge-type.constants";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { StdChargeFields } from "../components/std-charge-fields";
import { StdChargeLimitSummary } from "../components/std-charge-limit-summary";
import { StdChargeTypeToggle } from "../components/std-charge-type-toggle";
import { StdTotalValueCard } from "../components/std-total-value-card";
import { resolveSelectedLookupActiveState } from "@/features/requisitions-shared/lib/resolve-selected-lookup-active-state";
import { RequisitionDrawerFormActions } from "@/features/requisitions-shared/components/requisition-drawer-form-actions";


type Props = {
    open: boolean;
    title: string;
    shopId: string | null;
    initialValues?: StdCollectionChargeBanksAndBinsForm;
    mileageLimitRule?: RequisitionLimitRuleSummary;
    flatChargeLimitRule?: RequisitionLimitRuleSummary;
    onClose: () => void;
    onSave: (form: StdCollectionChargeBanksAndBinsForm) => void;
};

type SubmitIntent = "close" | "add-another";

export function StdCollectionChargeBanksAndBinsDrawer({
    open,
    title,
    shopId,
    initialValues,
    mileageLimitRule,
    flatChargeLimitRule,
    onClose,
    onSave,
}: Readonly<Props>) {
    const [form, setForm] = useState<StdCollectionChargeBanksAndBinsForm>(
        createEmptyStdCollectionChargeBanksAndBinsForm(),
    );

    const [errors, setErrors] = useState<Record<string, string>>({});

    const schema = createStdCollectionChargeBanksAndBinsFormSchema({
        mileageLimitRule,
        flatChargeLimitRule,
    });

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

    function setChargeType(
        chargeType: StdCollectionChargeBanksAndBinsForm["chargeType"],
    ) {
        setForm((prev) => ({
            ...prev,
            chargeType,
            miles: chargeType === STD_CHARGE_TYPE.Mileage ? prev.miles : null,
            ratePerMile:
                chargeType === STD_CHARGE_TYPE.Mileage ? prev.ratePerMile : null,
            flatCharge:
                chargeType === STD_CHARGE_TYPE.FlatCharge ? prev.flatCharge : null,
        }));

        clearError("chargeType");
        clearError("miles");
        clearError("ratePerMile");
        clearError("flatCharge");
        clearError("form");
    }

    function updateChargeFields(patch: Partial<Pick<StdCollectionChargeBanksAndBinsForm, "miles" | "ratePerMile" | "flatCharge">>) {
        setForm((prev) => ({
            ...prev,
            ...patch,
        }));

        Object.keys(patch).forEach(clearError);
        clearError("form");
    }

    if (!open) {
        return null;
    }

    return (
        <AppDrawer
            open={open}
            title={title}
            onClose={onClose}
        >
            <form
                id="std-banks-bins-drawer-form"
                noValidate
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

                {errors.form && <Alert tone="danger">{errors.form}</Alert>}

                <StdChargeLimitSummary
                    chargeType={form.chargeType}
                    mileageLimitRule={mileageLimitRule}
                    flatChargeLimitRule={flatChargeLimitRule}
                />

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
                    collectionTypeCode={form.collectionTypeCode}
                    isCollectionTypeActive={form.isCollectionTypeActive}
                    error={errors.collectionTypeId}
                    onChange={(value, label, collectionType) => {
                        setForm((prev) => {
                            const collectionTypeChanged = value !== prev.collectionTypeId;

                            return {
                                ...prev,
                                collectionTypeId: value,
                                collectionTypeLabel: collectionType?.name ?? label,
                                collectionTypeCode: collectionType?.code ?? null,
                                isCollectionTypeActive: resolveSelectedLookupActiveState({
                                    previousId: prev.collectionTypeId,
                                    previousIsActive: prev.isCollectionTypeActive,
                                    nextId: value,
                                }),

                                locationId: collectionTypeChanged ? null : prev.locationId,
                                locationLabel: collectionTypeChanged ? null : prev.locationLabel,
                                locationPostCode: collectionTypeChanged ? null : prev.locationPostCode,
                                isLocationActive: collectionTypeChanged
                                    ? true
                                    : prev.isLocationActive,
                            };
                        });

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
                    postCode={form.locationPostCode}
                    isLocationActive={form.isLocationActive}
                    error={errors.locationId}
                    onChange={(value, label, location) => {
                        setForm((prev) => ({
                            ...prev,
                            locationId: value,
                            locationLabel: location?.locationName ?? label,
                            locationPostCode: location?.postCode ?? null,
                            isLocationActive: resolveSelectedLookupActiveState({
                                previousId: prev.locationId,
                                previousIsActive: prev.isLocationActive,
                                nextId: value,
                            }),
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

                <StdChargeTypeToggle
                    value={form.chargeType}
                    error={errors.chargeType}
                    onChange={setChargeType}
                />

                <StdChargeFields
                    charge={form}
                    errors={{
                        miles: errors.miles,
                        ratePerMile: errors.ratePerMile,
                        flatCharge: errors.flatCharge,
                    }}
                    defaultRatePerMile={mileageLimitRule?.maxRate ?? null}
                    onChange={updateChargeFields}
                />

                {errors.form && <Alert tone="danger">{errors.form}</Alert>}

                <StdTotalValueCard value={totalValue} />

                <RequisitionDrawerFormActions
                    isEditMode={isEditMode}
                    onCancel={onClose}
                    onSaveAndClose={() => saveForm("close")}
                />
            </form>
        </AppDrawer>
    );
}