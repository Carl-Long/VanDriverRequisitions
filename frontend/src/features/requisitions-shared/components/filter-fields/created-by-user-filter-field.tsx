"use client";

import { Field } from "@/components/ui/field/field";
import { Combobox, type ComboboxOption } from "@/components/ui/field/combobox";
import { RequisitionUserFascia, requisitionUsersApi } from "../../lib/requisition-users-api";

export type CreatedByFilter =
    | { type: "any" }
    | { type: "me" }
    | { type: "user"; userId: string; label: string };

const ME_OPTION_VALUE = "__ME__";
const ANY_OPTION_VALUE = "__ANY__";

const STATIC_OPTIONS: ComboboxOption[] = [
    {
        value: ME_OPTION_VALUE,
        label: "Me",
    },
    {
        value: ANY_OPTION_VALUE,
        label: "Anyone",
    },
];

type Props = {
    value: CreatedByFilter;
    hideLabel?: boolean;
    fascia: RequisitionUserFascia;
    onChange: (value: CreatedByFilter) => void;
};

export function CreatedByUserFilterField({
    value,
    onChange,
    fascia,
    hideLabel = false,
}: Readonly<Props>) {
    const selectedValue = getSelectedValue(value);
    const selectedLabel = getSelectedLabel(value);

    async function searchUsers(search: string): Promise<ComboboxOption[]> {
        const response = await requisitionUsersApi.search({
            search,
            pageSize: 20,
            fascia,
        });

        return response.items.map((user) => ({
            value: user.id,
            label: user.name,
        }));
    }

    function handleChange(value: string | null, option: ComboboxOption | null) {
        if (value === ME_OPTION_VALUE) {
            onChange({ type: "me" });
            return;
        }

        if (value === ANY_OPTION_VALUE || value === null) {
            onChange({ type: "any" });
            return;
        }

        if (!option) {
            return;
        }

        onChange({
            type: "user",
            userId: value,
            label: option.label,
        });
    }

    const combobox = (
        <Combobox
            value={selectedValue}
            label={selectedLabel}
            placeholder="Created By: Anyone"
            emptyStateText="No users available"
            noMatchesText="No matching users found"
            pinnedOptions={STATIC_OPTIONS}
            searchDebounceMs={300}
            onSearch={searchUsers}
            onChange={handleChange}
        />
    );

    if (hideLabel) {
        return combobox;
    }

    return <Field label="Created By">{combobox}</Field>;
}

function getSelectedValue(value: CreatedByFilter) {
    switch (value.type) {
        case "any":
            return ANY_OPTION_VALUE;

        case "me":
            return ME_OPTION_VALUE;

        case "user":
            return value.userId;
    }
}

function getSelectedLabel(value: CreatedByFilter) {
    switch (value.type) {
        case "any":
            return "Created By: Anyone";

        case "me":
            return "Created By: Me";

        case "user":
            return `Created By: ${value.label}`;
    }
}