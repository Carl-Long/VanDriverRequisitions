"use client";

import { Field } from "@/components/ui/field/field";

import {
    Combobox,
    type ComboboxOption,
} from "@/components/ui/field/combobox";

import { requisitionUsersApi } from "@/lib/api/requisition-users";

import type { CreatedByFilter } from "../types";

const STATIC_OPTIONS: ComboboxOption[] = [
    {
        value: "__ME__",
        label: "Me",
    },

    {
        value: "__ANY__",
        label: "Anyone",
    },
];
type Props = {
    value: CreatedByFilter;

    onChange: (
        value: CreatedByFilter,
    ) => void;
};

export function CreatedByUserFilterField({
    value,
    onChange,
}: Readonly<Props>) {
    const selectedValue =
        value.type === "any"
            ? "__ANY__"
            : value.type === "me"
                ? "__ME__"
                : value.userId;

    const selectedLabel =
        value.type === "any"
            ? "Anyone"
            : value.type === "me"
                ? "Me"
                : value.label;

    return (
        <Field label="Requisition Created By">
            <Combobox
                value={selectedValue}
                label={selectedLabel}
                placeholder="Select creator..."
                pinnedOptions={STATIC_OPTIONS}
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
                    if (value === "__ME__") {
                        onChange({ type: "me", });
                        return;
                    }

                    if (value === "__ANY__") {
                        onChange({ type: "any", });
                        return;
                    }

                    if (option) {
                        onChange({
                            type: "user",
                            userId: value!,
                            label: option.label,
                        });
                    }
                }}
            />
        </Field>
    );
}