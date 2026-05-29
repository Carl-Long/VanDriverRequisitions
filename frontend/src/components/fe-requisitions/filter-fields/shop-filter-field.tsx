"use client";

import { Field } from "@/components/ui/field/field";
import { Combobox } from "@/components/ui/field/combobox";
import { shopsApi } from "@/lib/api/shops";

type Props = {
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
    disabled = false,
    value,
    label,
    error,
    hideLabel = false,
    includeAllOption = false,
    prefixLabel = false,
    onChange,
}: Readonly<Props>) {
    const combobox = (
        <Combobox
            disabled={disabled}
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
            noMatchesText="No matching shops found"
            pinnedOptions={
                includeAllOption
                    ? STATIC_OPTIONS
                    : []
            }
            placeholder="Shop: All shops"
            onSearch={async (search) => {
                const res =
                    await shopsApi.search({
                        search,
                        pageSize: 20,
                    });

                return res.items.map((x) => ({
                    value: x.id,
                    label: `${x.code} - ${x.name}`,
                }));
            }}
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
            label="Shop"
            error={error}
        >
            {combobox}
        </Field>
    );
}