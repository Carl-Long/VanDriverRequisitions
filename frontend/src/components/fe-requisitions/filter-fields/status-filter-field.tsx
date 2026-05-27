"use client";

import { Field } from "@/components/ui/field/field";
import { Combobox, type ComboboxOption, } from "@/components/ui/field/combobox";

import {
    REQUISITION_STATUSES,
    requisitionStatusConfig,
    type RequisitionStatus,
} from "../constants";

const options: ComboboxOption[] =
    REQUISITION_STATUSES.map((x) => ({
        value: x,
        label: requisitionStatusConfig[x].label,
    }));

type Props = {
    value: RequisitionStatus | "";

    onChange: (
        value: RequisitionStatus | "",
    ) => void;

    hideLabel?: boolean;
};

const STATIC_OPTIONS = [
    {
        value: "",
        label: "All statuses",
    },

    ...REQUISITION_STATUSES.map((s) => ({
        value: s,
        label: requisitionStatusConfig[s].label,
    })),
];

export function StatusFilterField({
    value,
    onChange,
    hideLabel = false,
}: Readonly<Props>) {
    const select = (
        <Combobox
            value={value}
            label={
                value
                    ? `Status: ${requisitionStatusConfig[
                        value
                    ].label
                    }`
                    : "Status: All statuses"
            }
            options={STATIC_OPTIONS}
            placeholder="Status: All statuses"
            onChange={(value) =>
                onChange(
                    (value as RequisitionStatus) ??
                    "",
                )
            }
        />
    );

    if (hideLabel) {
        return select;
    }

    return (
        <Field label="Status">
            {select}
        </Field>
    );
}