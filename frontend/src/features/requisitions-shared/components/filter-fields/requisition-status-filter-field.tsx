"use client";

import { Combobox } from "@/components/ui/field/combobox";
import { Field } from "@/components/ui/field/field";
import {
    REQUISITION_STATUSES,
    requisitionStatusConfig,
    type RequisitionStatus,
} from "@/features/requisitions-shared/constants/requisition-status.constants";

type Props = {
    value: RequisitionStatus | "";
    onChange: (value: RequisitionStatus | "") => void;
    hideLabel?: boolean;
};

const pinnedOptions = [
    {
        value: "",
        label: "All statuses",
    },
];

const statusOptions = REQUISITION_STATUSES.map((status) => ({
    value: status,
    label: requisitionStatusConfig[status].label,
}));

export function RequisitionStatusFilterField({
    value,
    onChange,
    hideLabel = false,
}: Readonly<Props>) {
    const selectedLabel = value
        ? `Status: ${requisitionStatusConfig[value].label}`
        : "Status: All";

    const field = (
        <Combobox
            value={value}
            label={selectedLabel}
            pinnedOptions={pinnedOptions}
            options={statusOptions}
            searchable={false}
            placeholder="Status: All statuses"
            noMatchesText="No matching status found"
            onChange={(nextValue) => {
                onChange((nextValue as RequisitionStatus | null) ?? "");
            }}
        />
    );

    if (hideLabel) {
        return field;
    }

    return <Field label="Status">{field}</Field>;
}