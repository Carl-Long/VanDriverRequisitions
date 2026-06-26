"use client";

import { useMemo } from "react";

import { Field } from "@/components/ui/field/field";
import { Combobox, type ComboboxOption } from "@/components/ui/field/combobox";
import { InactiveLookupWarning } from "@/features/requisitions-shared/components/inactive-lookup-warning";
import { vanDriversApi, type VanDriverLookup } from "@/lib/api/van-drivers";

type Props = {
    disabled?: boolean;
    value: string | null;
    label: string | null;
    error?: string;
    selectedVanDriver?: VanDriverLookup | null;
    onChange: (params: {
        id: string | null;
        label: string | null;
        summary: VanDriverLookup | null;
    }) => void;
};

type VanDriverOption = ComboboxOption<VanDriverLookup>;

export function VanDriverField({
    disabled,
    value,
    label,
    selectedVanDriver,
    error,
    onChange,
}: Readonly<Props>) {
    const showInactiveWarning = Boolean(value && selectedVanDriver?.isActive === false);

    const pinnedOptions = useMemo<VanDriverOption[]>(() => {
        if (!value || !label || selectedVanDriver?.isActive !== false) {
            return [];
        }

        return [
            {
                value,
                label,
                data: selectedVanDriver,
            },
        ];
    }, [value, label, selectedVanDriver]);

    async function searchVanDrivers(search: string): Promise<VanDriverOption[]> {
        const response = await vanDriversApi.search({
            search,
            pageSize: 20,
        });

        return response.items.map(mapVanDriverToOption);
    }

    function handleChange(value: string | null, option: VanDriverOption | null) {
        if (!value || !option) {
            onChange({
                id: null,
                label: null,
                summary: null,
            });

            return;
        }

        onChange({
            id: value,
            label: option.label,
            summary: option.data ?? null,
        });
    }

    return (
        <Field label="Van Driver" error={error} required>
            <div className="space-y-2">
                <Combobox<VanDriverLookup>
                    disabled={disabled}
                    state={error ? "error" : "default"}
                    value={value}
                    label={label}
                    searchDebounceMs={300}
                    pinnedOptions={pinnedOptions}
                    placeholder="Search van drivers..."
                    noMatchesText="No matching van drivers found"
                    emptyStateText="No van drivers available"
                    onSearch={searchVanDrivers}
                    onChange={handleChange}
                />

                {showInactiveWarning && (
                    <InactiveLookupWarning label="van driver" variant="field" />
                )}
            </div>
        </Field>
    );
}

function mapVanDriverToOption(vanDriver: VanDriverLookup): VanDriverOption {
    return {
        value: vanDriver.id,
        label: `${vanDriver.code} - ${vanDriver.tradersName}`,
        data: vanDriver,
    };
}