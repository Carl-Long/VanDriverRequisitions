"use client";

import { Field } from "@/components/ui/field/field";
import { Combobox, ComboboxOption } from "@/components/ui/field/combobox";
import { vanDriversApi, VanDriverLookup } from "@/lib/api/van-drivers";

type Props = {
    disabled?: boolean;
    value: string | null;
    label: string | null;
    error?: string;
    onChange: (
        params: {
            id: string | null;
            label: string | null;
            summary: VanDriverLookup | null;
        },
    ) => void;
};

export function FeVanDriverField({
    disabled,
    value,
    label,
    error,
    onChange,
}: Readonly<Props>) {
    return (
        <Field
            label="Van Driver"
            error={error}
            required
        >
            <Combobox
                disabled={disabled}
                state={error ? "error" : "default"}
                value={value}
                label={label}
                placeholder="Search van drivers..."
                noMatchesText="No matching van drivers found"
                onSearch={async (search) => {
                    const response =
                        await vanDriversApi.search({
                            search,
                            pageSize: 20,
                        });

                    return response.items.map(
                        (
                            x,
                        ): ComboboxOption => ({
                            value: x.id,
                            label: `${x.code} - ${x.tradersName}`,
                            data: x
                        }),
                    );
                }}
                onChange={(
                    value,
                    option,
                ) => {
                    if (
                        !value ||
                        !option
                    ) {
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
                        summary: option.data as VanDriverLookup,
                    });
                }}
            />
        </Field>
    );
}