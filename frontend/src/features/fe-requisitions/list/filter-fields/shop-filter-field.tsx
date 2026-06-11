"use client";

import { useEffect, useState } from "react";
import { Field } from "@/components/ui/field/field";
import { Combobox, type ComboboxOption } from "@/components/ui/field/combobox";
import { shopsApi } from "@/lib/api/shops";
import { toShopOptions } from "@/lib/options/shop-options";

type Props = {
    required?: boolean;
    disabled?: boolean;
    value: string | null;
    label: string | null;
    error?: string;
    hideLabel?: boolean;
    includeAllOption?: boolean;
    prefixLabel?: boolean;
    onChange: (
        value: string | null,
        label: string | null,
    ) => void;
};

const STATIC_OPTIONS = [
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
    includeAllOption = false,
    prefixLabel = false,
    onChange,
}: Readonly<Props>) {
    const [options, setOptions] = useState<ComboboxOption[]>([]);
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

    const combobox = (
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
            emptyStateText={
                loading
                    ? "Loading shops..."
                    : "No shops available"
            }
            noMatchesText="No matching shops found"
            pinnedOptions={
                includeAllOption
                    ? STATIC_OPTIONS
                    : []
            }
            placeholder={
                loading
                    ? "Loading shops..."
                    : "Shop: All shops"
            }
            onChange={(value, option) => {
                if (value === "__ALL__") {
                    onChange(null, null);
                    return;
                }

                onChange(
                    value,
                    option?.label ?? null,
                );
            }}
        />
    );

    if (hideLabel) {
        return combobox;
    }

    return (
        <Field
            required={required}
            label="Shop"
            error={error}
        >
            {combobox}
        </Field>
    );
}