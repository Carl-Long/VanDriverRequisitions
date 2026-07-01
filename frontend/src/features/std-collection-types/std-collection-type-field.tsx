"use client";

import { useEffect, useMemo, useState } from "react";
import { Combobox, type ComboboxOption } from "@/components/ui/field/combobox";
import { Field } from "@/components/ui/field/field";
import { StdCollectionTypeLookup, stdCollectionTypesApi } from "./std-collection-types-api";
import { InactiveLookupWarning } from "../requisitions-shared/components/inactive-lookup-warning";

const ALL_COLLECTION_TYPES_VALUE = "__ALL__";

const STATIC_OPTIONS = [
    {
        value: ALL_COLLECTION_TYPES_VALUE,
        label: "All collection types",
    },
] as ComboboxOption<StdCollectionTypeLookup>[];

type Props = {
    value: string | null;
    label: string | null;
    collectionTypeCode?: string | null;
    isCollectionTypeActive?: boolean | null;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    includeAllOption?: boolean;
    prefixLabel?: boolean;
    hideLabel?: boolean;
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
    collectionTypeCode,
    isCollectionTypeActive,
    required = false,
    disabled = false,
    includeAllOption = false,
    prefixLabel = false,
    hideLabel = false,
    onChange,
}: Readonly<Props>) {
    const [items, setItems] = useState<StdCollectionTypeLookup[]>([]);
    const [loading, setLoading] = useState(false);
    const showInactiveWarning = Boolean(value && isCollectionTypeActive === false);

    const inactiveSelectedOptions = useMemo<ComboboxOption<StdCollectionTypeLookup>[]>(() => {
        if (!value || !label || isCollectionTypeActive !== false) {
            return [];
        }

        return [
            {
                value,
                label: collectionTypeCode ? `${collectionTypeCode} - ${label}` : label,
                data: {
                    id: value,
                    code: collectionTypeCode ?? "",
                    name: label,
                },
            },
        ];
    }, [value, label, collectionTypeCode, isCollectionTypeActive]);

    const pinnedOptions = useMemo<ComboboxOption<StdCollectionTypeLookup>[]>(() => {
        return [
            ...(includeAllOption ? STATIC_OPTIONS : []),
            ...inactiveSelectedOptions,
        ];
    }, [includeAllOption, inactiveSelectedOptions]);

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

    const selectedLabel = label ?? "All collection types";
    const displayLabel = prefixLabel ? `Collection type: ${selectedLabel}` : label;

    const combobox = (
        <div className="space-y-2">
            <Combobox<StdCollectionTypeLookup>
                disabled={disabled || loading}
                value={value}
                label={displayLabel}
                options={options}
                pinnedOptions={pinnedOptions}
                placeholder={loading ? "Loading collection types..." : "Select collection type"}
                noMatchesText="No matching collection type found"
                emptyStateText="No active collection types"
                state={error ? "error" : "default"}
                onChange={(nextValue, option) => {
                    if (nextValue === ALL_COLLECTION_TYPES_VALUE) {
                        onChange(null, null, null);
                        return;
                    }

                    onChange(nextValue, option?.label ?? null, option?.data ?? null);
                }}
            />

            {showInactiveWarning && (
                <InactiveLookupWarning label="collection type" variant="field" />
            )}
        </div>
    );

    if (hideLabel) {
        return combobox;
    }

    return (
        <Field label="Collection Type" required={required} error={error}>
            {combobox}
        </Field>
    );
}