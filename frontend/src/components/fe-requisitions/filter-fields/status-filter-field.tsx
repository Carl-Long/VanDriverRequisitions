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
};

export function StatusFilterField({
    value,
    onChange,
}: Readonly<Props>) {
    return (
        <Field label="Status">
            <Combobox
                value={value || null}
                label={
                    value
                        ? requisitionStatusConfig[
                            value
                        ].label
                        : null
                }
                options={options}
                placeholder="All statuses"
                onChange={(value) =>
                    onChange(
                        (value as RequisitionStatus) ||
                        "",
                    )
                }
            />
        </Field>
    );
}