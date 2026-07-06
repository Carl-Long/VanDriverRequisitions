"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Combobox } from "@/components/ui/field/combobox";
import { Field } from "@/components/ui/field/field";
import { shopsApi } from "@/lib/api/shops";
import { toShopOptions, type ShopOption } from "@/lib/options/shop-options";

import {
    InactiveLookupWarning,
    type InactiveLookupWarningContext,
} from "../inactive-lookup-warning";

type Props = {
    required?: boolean;
    disabled?: boolean;
    value: string | null;
    label: string | null;
    error?: string;
    hideLabel?: boolean;
    fieldLabel?: string;
    placeholder?: string;
    includeAllOption?: boolean;
    prefixLabel?: boolean;
    isShopActive?: boolean | null;
    inactiveWarningContext?: InactiveLookupWarningContext;
    onChange: (value: string | null, label: string | null) => void;
};

const ALL_SHOPS_OPTION_VALUE = "__ALL__";

const ALL_SHOPS_OPTION: ShopOption = {
    value: ALL_SHOPS_OPTION_VALUE,
    label: "All shops",
};

export function ShopFilterField({
    required = false,
    disabled = false,
    value,
    label,
    error,
    hideLabel = false,
    fieldLabel = "Shop",
    placeholder = "Select Shop",
    includeAllOption = false,
    prefixLabel = false,
    isShopActive,
    inactiveWarningContext = "editable",
    onChange,
}: Readonly<Props>) {
    const [options, setOptions] = useState<ShopOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadShopOptions() {
            setLoading(true);

            try {
                const shops = await shopsApi.getCachedActiveLookups();

                if (!cancelled) {
                    setOptions(toShopOptions(shops));
                }
            } catch {
                if (!cancelled) {
                    setOptions([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadShopOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    const showInactiveWarning = Boolean(value && isShopActive === false);

    const inactiveSelectedOptions = useMemo<ShopOption[]>(() => {
        if (!value || !label || isShopActive !== false) {
            return [];
        }

        return [
            {
                value,
                label,
            },
        ];
    }, [isShopActive, label, value]);

    const pinnedOptions = useMemo<ShopOption[]>(() => {
        const allShopOptions = includeAllOption ? [ALL_SHOPS_OPTION] : [];

        return [...allShopOptions, ...inactiveSelectedOptions];
    }, [includeAllOption, inactiveSelectedOptions]);

    const handleChange = useCallback(
        (selectedValue: string | null, option?: ShopOption | null) => {
            if (selectedValue === ALL_SHOPS_OPTION_VALUE) {
                onChange(null, null);
                return;
            }

            onChange(selectedValue, option?.label ?? null);
        },
        [onChange],
    );

    const fieldContent = (
        <div className="space-y-2">
            <Combobox
                disabled={disabled || loading}
                state={error ? "error" : "default"}
                value={value}
                label={getShopComboboxLabel({ label, prefixLabel })}
                options={options}
                emptyStateText={loading ? "Loading shops..." : "No shops available"}
                noMatchesText="No matching shops found"
                pinnedOptions={pinnedOptions}
                placeholder={loading ? "Loading shops..." : placeholder}
                onChange={handleChange}
            />

            {showInactiveWarning && (
                <InactiveLookupWarning
                    label="shop"
                    variant="field"
                    context={inactiveWarningContext}
                />
            )}
        </div>
    );

    if (hideLabel) {
        return fieldContent;
    }

    return (
        <Field required={required} label={fieldLabel} error={error}>
            {fieldContent}
        </Field>
    );
}

function getShopComboboxLabel({
    label,
    prefixLabel,
}: {
    label: string | null;
    prefixLabel: boolean;
}) {
    if (label) {
        return prefixLabel ? `Shop: ${label}` : label;
    }

    return prefixLabel ? "Shop: All shops" : null;
}