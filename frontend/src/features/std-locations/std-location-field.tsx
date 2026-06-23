"use client";

import { useEffect, useMemo, useState } from "react";

import { Combobox, type ComboboxOption } from "@/components/ui/field/combobox";
import { Field } from "@/components/ui/field/field";
import { stdLocationsApi } from "./std-locations-api";
import { StdLocationLookup } from "./std-location.types";


type Props = {
    shopId: string | null;
    collectionTypeId: string | null;
    value: string | null;
    label: string | null;
    error?: string;
    required?: boolean;
    disabled?: boolean;
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
    onChange,
}: Readonly<Props>) {
    const [items, setItems] = useState<StdLocationLookup[]>([]);
    const [loading, setLoading] = useState(false);

    const canLoad = Boolean(shopId && collectionTypeId);

    let placeholder = "Select location";

    if (!shopId) {
        placeholder = "Select a shop first";
    } else if (!collectionTypeId) {
        placeholder = "Select a collection type first";
    } else if (loading) {
        placeholder = "Loading locations...";
    }

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
            <Combobox<StdLocationLookup>
                disabled={disabled || loading || !canLoad}
                value={value}
                label={label}
                options={options}
                placeholder={placeholder}
                noMatchesText="No matching location found"
                emptyStateText="No active locations for this shop and collection type"
                state={error ? "error" : "default"}
                onChange={(nextValue, option) => {
                    onChange(nextValue, option?.label ?? null, option?.data ?? null);
                }}
            />
        </Field>
    );
}