"use client";

import { Field } from "@/components/ui/field/field";
import { Combobox } from "@/components/ui/field/combobox";
import { shopsApi } from "@/lib/api/shops";

type Props = {
    value: string | null;
    label: string | null;
    onChange: (
        value: string | null,
        label: string | null,
    ) => void;
};

export function ShopFilterField({
    value,
    label,
    onChange,
}: Readonly<Props>) {
    return (
        <Field label="Shop">
            <Combobox
                value={value}
                label={label}
                placeholder="Select shop..."
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
                    onChange(
                        value,
                        option?.label ?? null,
                    );
                }}
            />
        </Field>
    );
}