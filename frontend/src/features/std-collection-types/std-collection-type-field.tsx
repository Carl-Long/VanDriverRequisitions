"use client";

import { useEffect, useMemo, useState } from "react";

import { Combobox, type ComboboxOption } from "@/components/ui/field/combobox";
import { Field } from "@/components/ui/field/field";
import { StdCollectionTypeLookup, stdCollectionTypesApi } from "./std-collection-types-api";

type Props = {
    value: string | null;
    label: string | null;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    onChange: (
        value: string | null,
        label: string | null,
        collectionType: StdCollectionTypeLookup | null,
    ) => void;
};

export function StdCollectionTypeField({
    value,
    label,
    error,
    required = false,
    disabled = false,
    onChange,
}: Readonly<Props>) {
    const [items, setItems] = useState<StdCollectionTypeLookup[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            setLoading(true);

            try {
                const result = await stdCollectionTypesApi.getCachedActiveLookups();

                if (!cancelled) {
                    setItems(result);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, []);

    const options = useMemo<ComboboxOption<StdCollectionTypeLookup>[]>(() => {
        return items.map((item) => ({
            value: item.id,
            label: `${item.code} - ${item.name}`,
            data: item,
        }));
    }, [items]);

    return (
        <Field label="Collection Type" error={error} required={required}>
            <Combobox<StdCollectionTypeLookup>
                disabled={disabled || loading}
                value={value}
                label={label}
                options={options}
                placeholder={loading ? "Loading collection types..." : "Select collection type"}
                noMatchesText="No matching collection type found"
                emptyStateText="No active collection types"
                state={error ? "error" : "default"}
                onChange={(nextValue, option) => {
                    onChange(nextValue, option?.label ?? null, option?.data ?? null);
                }}
            />
        </Field>
    );
}