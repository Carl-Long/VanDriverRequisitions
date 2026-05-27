"use client";

import { Field } from "@/components/ui/field/field";
import { Combobox } from "@/components/ui/field/combobox";
import { requisitionUsersApi } from "@/lib/api/requisition-users";

type Props = {
    value: string | null;
    label: string | null;
    onChange: (
        value: string | null,
        label: string | null,
    ) => void;
};

export function CreatedByUserFilterField({
    value,
    label,
    onChange,
}: Readonly<Props>) {
    return (
        <Field label="Created By">
            <Combobox
                value={value}
                label={label}
                placeholder="Select user..."
                onSearch={async (search) => {
                    const res =
                        await requisitionUsersApi.search({
                            search,
                            pageSize: 20,
                        });

                    return res.items.map((x) => ({
                        value: x.id,
                        label: x.name,
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