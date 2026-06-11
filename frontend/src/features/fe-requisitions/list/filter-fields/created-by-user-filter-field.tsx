"use client";

import { Field } from "@/components/ui/field/field";

import {
    Combobox,
    type ComboboxOption,
} from "@/components/ui/field/combobox";

import { requisitionUsersApi } from "@/features/fe-requisitions/list/lib/requisition-users-api";
import { CreatedByFilter } from "../../types/fe-requisiton-filters.types";

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
    hideLabel?: boolean;

    onChange: (
        value: CreatedByFilter,
    ) => void;
};

export function CreatedByUserFilterField({
    value,
    onChange,
    hideLabel = false,
}: Readonly<Props>) {
    const selectedValue =
        value.type === "any"
            ? "__ANY__"
            : value.type === "me"
                ? "__ME__"
                : value.userId;

    const selectedLabel =
        value.type === "me"
            ? "Created By: Me"
            : value.type === "any"
                ? "Created By: Anyone"
                : `Created By: ${value.label}`;

    const combobox = (
        <Combobox
            value={selectedValue}
            label={selectedLabel}
            placeholder="Created By: Anyone"
            noMatchesText="No matching users found"
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
                    onChange({
                        type: "me",
                    });

                    return;
                }

                if (value === "__ANY__") {
                    onChange({
                        type: "any",
                    });

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
    );

    if (hideLabel) {
        return combobox;
    }

    return (
        <Field label="Created By">
            {combobox}
        </Field>
    )
}