"use client";

import { Field } from "@/components/ui/field/field";
import { Combobox } from "@/components/ui/field/combobox";

import {
    REQUISITION_STATUSES,
    requisitionStatusConfig,
    RequisitionStatus,
} from "@/features/fe-requisitions/constants/fe-requisition-status.constants";

type Props = {
    value: RequisitionStatus | "";

    onChange: (value: RequisitionStatus | "") => void;

    hideLabel?: boolean;
};

const STATIC_OPTIONS = [
    {
        value: "",
        label: "All statuses",
    },
];
const statusOptions = [
    ...REQUISITION_STATUSES.map((s) => ({
        value: s,
        label: requisitionStatusConfig[s].label,
    })),
];

export function StatusFilterField({ value, onChange, hideLabel = false }: Readonly<Props>) {
    const select = (
        <Combobox
            value={value}
            label={value ? `Status: ${requisitionStatusConfig[value].label}` : "Status: All"}
            pinnedOptions={STATIC_OPTIONS}
            options={statusOptions}
            placeholder="Status: All statuses"
            noMatchesText="No matching status found"
            onChange={(value) => onChange((value as RequisitionStatus) ?? "")}
        />
    );

    if (hideLabel) {
        return select;
    }

    return <Field label="Status">{select}</Field>;
}
