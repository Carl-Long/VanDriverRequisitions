"use client";

import { Field } from "@/components/ui/field/field";
import { Combobox, ComboboxOption } from "@/components/ui/field/combobox";
import { vanDriversApi, VanDriverLookup } from "@/lib/api/van-drivers";
import { useMemo } from "react";
import { InactiveLookupWarning } from "@/features/requisitions-shared/components/inactive-lookup-warning";

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
    return (
        <Field label="Van Driver" error={error} required>
            <div className="space-y-2">
                <Combobox<VanDriverLookup>
                    disabled={disabled}
                    state={error ? "error" : "default"}
                    value={value}
                    label={label}
                    pinnedOptions={pinnedOptions}
                    placeholder="Search van drivers..."
                    noMatchesText="No matching van drivers found"
                    emptyStateText="No van drivers available"
                    onSearch={async (search) => {
                        const response = await vanDriversApi.search({
                            search,
                            pageSize: 20,
                        });

                        return response.items.map(
                            (x): VanDriverOption => ({
                                value: x.id,
                                label: `${x.code} - ${x.tradersName}`,
                                data: x,
                            }),
                        );
                    }}
                    onChange={(value, option) => {
                        if (!value || !option) {
                            onChange({ id: null, label: null, summary: null });
                            return;
                        }

                        onChange({
                            id: value,
                            label: option.label,
                            summary: option.data ?? null,
                        });
                    }}
                />

                {showInactiveWarning && (
                    <InactiveLookupWarning label="van driver" variant="field" />
                )}
            </div>
        </Field>
    );
}
