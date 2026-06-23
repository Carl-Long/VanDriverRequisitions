"use client";

import { useEffect, useMemo, useState } from "react";
import { Field } from "@/components/ui/field/field";
import { Combobox } from "@/components/ui/field/combobox";
import { shopsApi } from "@/lib/api/shops";
import { toShopOptions, type ShopOption } from "@/lib/options/shop-options";
import { InactiveLookupWarning } from "../inactive-lookup-warning";

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
    onChange: (value: string | null, label: string | null) => void;
};

const STATIC_OPTIONS: ShopOption[] = [
    {
        value: "__ALL__",
        label: "All shops",
    },
];

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
    onChange,
}: Readonly<Props>) {
    const [options, setOptions] = useState<ShopOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadOptions() {
            setLoading(true);

            try {
                const shops = await shopsApi.getCachedActiveLookups();

                if (!cancelled) {
                    setOptions(toShopOptions(shops));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadOptions();

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
    }, [value, label, isShopActive]);

    const pinnedOptions = useMemo<ShopOption[]>(() => {
        return [
            ...(includeAllOption ? STATIC_OPTIONS : []),
            ...inactiveSelectedOptions,
        ];
    }, [includeAllOption, inactiveSelectedOptions]);

    const combobox = (
        <div className="space-y-2">
            <Combobox
                disabled={disabled || loading}
                state={error ? "error" : "default"}
                value={value}
                label={
                    label
                        ? prefixLabel
                            ? `Shop: ${label}`
                            : label
                        : prefixLabel
                            ? "Shop: All shops"
                            : null
                }
                options={options}
                emptyStateText={loading ? "Loading shops..." : "No shops available"}
                noMatchesText="No matching shops found"
                pinnedOptions={pinnedOptions}
                placeholder={loading ? "Loading shops..." : placeholder}
                onChange={(value, option) => {
                    if (value === "__ALL__") {
                        onChange(null, null);
                        return;
                    }

                    onChange(value, option?.label ?? null);
                }}
            />

            {showInactiveWarning && (
                <InactiveLookupWarning label="shop" variant="field" />
            )}
        </div>
    );
    if (hideLabel) {
        return combobox;
    }

    return (
        <Field required={required} label={fieldLabel} error={error}>
            {combobox}
        </Field>
    );
}
