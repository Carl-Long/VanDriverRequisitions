"use client";

import { useEffect, useMemo, useState } from "react";

import { Combobox, type ComboboxOption } from "@/components/ui/field/combobox";
import { Field } from "@/components/ui/field/field";
import { stdLocationsApi } from "./std-locations-api";
import { StdLocationLookup } from "./std-location.types";
import { Alert } from "@/components/ui/alert";
import { InactiveLookupWarning } from "../requisitions-shared/components/inactive-lookup-warning";


type Props = {
    shopId: string | null;
    collectionTypeId: string | null;
    value: string | null;
    label: string | null;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    postCode?: string | null;
    isLocationActive?: boolean | null;
    onChange: (
        value: string | null,
        label: string | null,
        location: StdLocationLookup | null,
    ) => void;
};

export function StdLocationField({
    shopId,
    collectionTypeId,
    value,
    label,
    error,
    required = false,
    disabled = false,
    postCode,
    isLocationActive,
    onChange,
}: Readonly<Props>) {
    const [items, setItems] = useState<StdLocationLookup[]>([]);
    const [loading, setLoading] = useState(false);

    const showInactiveWarning = Boolean(value && isLocationActive === false);
    const displayLabel = label && postCode
        ? `${label} - ${postCode}`
        : label;

    const canLoad = Boolean(shopId && collectionTypeId);

    let placeholder = "Select location";

    if (!shopId) {
        placeholder = "Select a shop first";
    } else if (!collectionTypeId) {
        placeholder = "Select a collection type first";
    } else if (loading) {
        placeholder = "Loading locations...";
    }

    const pinnedOptions = useMemo<ComboboxOption<StdLocationLookup>[]>(() => {
        if (!value || !label || isLocationActive !== false) {
            return [];
        }

        return [
            {
                value,
                label: postCode ? `${label} - ${postCode}` : label,
                data: {
                    id: value,
                    shopId: shopId ?? "",
                    collectionTypeId: collectionTypeId ?? "",
                    locationName: label,
                    postCode: postCode ?? "",
                },
            },
        ];
    }, [value, label, postCode, shopId, collectionTypeId, isLocationActive]);

    useEffect(() => {
        if (!shopId || !collectionTypeId) {
            setItems([]);
            setLoading(false);
            return;
        }

        const selectedShopId = shopId;
        const selectedCollectionTypeId = collectionTypeId;

        let cancelled = false;

        async function run() {
            setLoading(true);

            try {
                const result = await stdLocationsApi.getCachedActiveLookups({
                    shopId: selectedShopId,
                    collectionTypeId: selectedCollectionTypeId,
                });

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
    }, [shopId, collectionTypeId]);

    const options = useMemo<ComboboxOption<StdLocationLookup>[]>(() => {
        return items.map((item) => ({
            value: item.id,
            label: `${item.locationName} - ${item.postCode}`,
            data: item,
        }));
    }, [items]);

    return (
        <Field label="Location" error={error} required={required}>
            <div className="space-y-2">
                <Combobox<StdLocationLookup>
                    disabled={disabled || loading || !canLoad}
                    value={value}
                    label={displayLabel}
                    options={options}
                    pinnedOptions={pinnedOptions}
                    placeholder={placeholder}
                    noMatchesText="No matching location found"
                    emptyStateText="No active locations for this shop and collection type"
                    state={error ? "error" : "default"}
                    onChange={(nextValue, option) => {
                        onChange(nextValue, option?.label ?? null, option?.data ?? null);
                    }}
                />

                {showInactiveWarning && (
                    <InactiveLookupWarning label="location" variant="field" />
                )}
            </div>
        </Field>
    );
}