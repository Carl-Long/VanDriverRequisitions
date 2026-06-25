"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { AppDrawer } from "@/components/ui/drawer";
import { DatePicker } from "@/components/ui/date/date-picker";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { formatCurrencyGB } from "@/lib/format/currency";
import type { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";

import type { StdCollectionVanPackForm } from "../types/std-collection-van-pack-form";
import { createEmptyStdCollectionVanPackForm } from "../lib/create-empty-std-collection-van-pack-form";
import {
    calculateStdCollectionVanPackFormTotal,
    calculateStdCollectionVanPackPercentReturned,
    calculateStdCollectionVanPackUnusedVanPacks,
} from "../lib/calculate-std-collection-van-pack-form";
import { createStdCollectionVanPackFormSchema } from "../schemas/create-std-collection-van-pack-form-schema";
import { mapZodErrors } from "@/features/requisitions-shared/lib/map-zod-errors";
import { RequisitionDrawerFormActions } from "@/features/requisitions-shared/components/requisition-drawer-form-actions";
import { focusFirstFormControl } from "@/features/requisitions-shared/lib/focus-first-form-control";

type Props = {
    open: boolean;
    title: string;
    vanPackLimitRule?: RequisitionLimitRuleSummary;
    initialValues?: StdCollectionVanPackForm;
    onClose: () => void;
    onSave: (form: StdCollectionVanPackForm) => void;
};

type SubmitIntent = "close" | "add-another";

export function StdCollectionVanPackDrawer({
    open,
    title,
    vanPackLimitRule,
    initialValues,
    onClose,
    onSave,
}: Readonly<Props>) {
    const [form, setForm] = useState<StdCollectionVanPackForm>(
        createEmptyStdCollectionVanPackForm(),
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement | null>(null);

    const isEditMode = initialValues !== undefined;
    const schema = createStdCollectionVanPackFormSchema(vanPackLimitRule);

    useEffect(() => {
        if (!open) {
            return;
        }

        setForm(initialValues ?? createEmptyStdCollectionVanPackForm());
        setErrors({});
    }, [open, initialValues]);

    const unusedVanPacks = useMemo(
        () => calculateStdCollectionVanPackUnusedVanPacks(form),
        [form],
    );

    const percentReturned = useMemo(
        () => calculateStdCollectionVanPackPercentReturned(form),
        [form],
    );

    const totalValue = useMemo(
        () =>
            calculateStdCollectionVanPackFormTotal(
                form,
                vanPackLimitRule?.maxRate ?? 0,
            ),
        [form, vanPackLimitRule],
    );

    function clearError(field: string) {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

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

        setForm(createEmptyStdCollectionVanPackForm(result.data.deliveryDate));
        focusFirstFormControl(formRef.current);
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
                ref={formRef}
                id="van-pack-drawer-form"
                noValidate
                className="space-y-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    saveForm(isEditMode ? "close" : "add-another");
                }}
            >
                <div className="flex gap-3 rounded-xl border border-border bg-surface-subtle p-4">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div className="text-sm">
                        <div className="font-medium">Van Pack Limits</div>

                        {vanPackLimitRule ? (
                            <div className="mt-1 text-muted-foreground">
                                Maximum van packs out:{" "}
                                <strong className="text-foreground">
                                    {vanPackLimitRule.maxQuantity}
                                </strong>
                                {" "}• Fixed price per van pack:{" "}
                                <strong className="text-foreground">
                                    {formatCurrencyGB(vanPackLimitRule.maxRate)}
                                </strong>
                            </div>
                        ) : (
                            <div className="mt-1 text-muted-foreground">
                                No STD van pack pricing rule is configured.
                            </div>
                        )}
                    </div>
                </div>

                {errors.form && <Alert>{errors.form}</Alert>}

                <Field label="Delivery Date" required error={errors["deliveryDate"]}>
                    <DatePicker
                        value={form.deliveryDate ?? undefined}
                        onChange={(date) => {
                            setForm((prev) => ({
                                ...prev,
                                deliveryDate: date ?? null,
                            }));

                            clearError("deliveryDate");
                            clearError("form");
                        }}
                    />
                </Field>

                <Field label="Postcode Zone" required error={errors["postCodeZone"]}>
                    <Input
                        value={form.postCodeZone}
                        state={errors["postCodeZone"] ? "error" : "default"}
                        onChange={(event) => {
                            setForm((prev) => ({
                                ...prev,
                                postCodeZone: event.target.value,
                            }));

                            clearError("postCodeZone");
                        }}
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Van Packs Out" required error={errors["vanPacksOut"]}>
                        <Input
                            type="number"
                            min={0}
                            step={1}
                            value={form.vanPacksOut ?? ""}
                            state={errors["vanPacksOut"] ? "error" : "default"}
                            onChange={(event) => {
                                setForm((prev) => ({
                                    ...prev,
                                    vanPacksOut: event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                }));

                                clearError("vanPacksOut");
                                clearError("filledBags");
                                clearError("form");
                            }}
                        />
                    </Field>

                    <Field label="Filled Bags" required error={errors["filledBags"]}>
                        <Input
                            type="number"
                            min={0}
                            step={1}
                            value={form.filledBags ?? ""}
                            state={errors["filledBags"] ? "error" : "default"}
                            onChange={(event) => {
                                setForm((prev) => ({
                                    ...prev,
                                    filledBags: event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                }));

                                clearError("filledBags");
                                clearError("form");
                            }}
                        />
                    </Field>
                </div>

                <div className="rounded-2xl border border-border bg-surface-subtle p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Unused Van Packs</span>
                        <span className="font-medium">{unusedVanPacks}</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Percent Returned</span>
                        <span className="font-medium">
                            {percentReturned.toFixed(2)}%
                        </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Value</span>
                        <span className="font-medium">
                            {formatCurrencyGB(totalValue)}
                        </span>
                    </div>
                </div>

                <RequisitionDrawerFormActions
                    isEditMode={isEditMode}
                    onCancel={onClose}
                    onSaveAndClose={() => saveForm("close")}
                />
            </form>
        </AppDrawer>
    );
}