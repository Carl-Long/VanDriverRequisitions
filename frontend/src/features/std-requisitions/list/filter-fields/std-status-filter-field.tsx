"use client";

import { Field } from "@/components/ui/field/field";
import { Combobox } from "@/components/ui/field/combobox";
import {
    STD_REQUISITION_STATUSES,
    stdRequisitionStatusConfig,
    type StdRequisitionStatus,
} from "../../constants/std-requisition-status.constants";

const STATIC_OPTIONS = [
    {
        value: "",
        label: "All statuses",
    },
];

const statusOptions = STD_REQUISITION_STATUSES.map((status) => ({
    value: status,
    label: stdRequisitionStatusConfig[status].label,
}));

type Props = {
    value: StdRequisitionStatus | "";
    onChange: (value: StdRequisitionStatus | "") => void;
    hideLabel?: boolean;
};

export function StdStatusFilterField({ value, onChange, hideLabel = false }: Readonly<Props>) {
    const select = (
        <Combobox
            value={value}
            label={value ? `Status: ${stdRequisitionStatusConfig[value].label}` : "Status: All"}
            pinnedOptions={STATIC_OPTIONS}
            options={statusOptions}
            searchable={false}
            placeholder="Status: All statuses"
            noMatchesText="No matching status found"
            onChange={(value) => onChange((value as StdRequisitionStatus) ?? "")}
        />
    );

    if (hideLabel) {
        return select;
    }

    return <Field label="Status">{select}</Field>;
}