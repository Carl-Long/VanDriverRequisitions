"use client";

import { useEffect, useMemo, useState } from "react";

import { Field } from "@/components/ui/field/field";
import { Combobox, type ComboboxOption } from "@/components/ui/field/combobox";
import { CostReasonLookup } from "./cost-reason.types";
import { costReasonsApi } from "./cost-reasons-api";
import { RequisitionFascia } from "@/lib/constants/fascias";
import { InactiveLookupWarning } from "../requisitions-shared/components/inactive-lookup-warning";


type ReasonOptionData = CostReasonLookup;

type ReasonOption = ComboboxOption<ReasonOptionData>;

type Props = {
    fascia: RequisitionFascia;
    required?: boolean;
    disabled?: boolean;
    value: string | null;
    reasonCode?: string | null;
    reasonText?: string | null;
    isReasonActive?: boolean | null;
    error?: string;
    hideLabel?: boolean;
    onChange: (value: string | null, reason: CostReasonLookup | null) => void;
};

function toReasonOptions(reasons: CostReasonLookup[]): ReasonOption[] {
    return reasons
        .map((reason) => ({
            value: reason.id,
            label: reason.displayName || `${reason.code} - ${reason.reason}`,
            data: reason,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

export function CostReasonField({
    fascia,
    required = false,
    disabled = false,
    value,
    reasonCode,
    reasonText,
    isReasonActive,
    error,
    hideLabel = false,
    onChange,
}: Readonly<Props>) {
    const [options, setOptions] = useState<ReasonOption[]>([]);
    const [loading, setLoading] = useState(true);
    const showInactiveWarning = Boolean(value && isReasonActive === false);

    useEffect(() => {
        let cancelled = false;

        async function loadOptions() {
            setLoading(true);

            try {
                const result = await costReasonsApi.getLookups(fascia);

                if (!cancelled) {
                    setOptions(toReasonOptions(result));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadOptions();

        return () => {
            cancelled = true;
        };
    }, [fascia]);

    const pinnedOptions = useMemo<ReasonOption[]>(() => {
        if (!value || !reasonCode || !reasonText || isReasonActive !== false) {
            return [];
        }

        return [
            {
                value,
                label: `${reasonCode} - ${reasonText}`,
                data: {
                    id: value,
                    code: reasonCode,
                    reason: reasonText,
                    displayName: `${reasonCode} - ${reasonText}`,
                },
            },
        ];
    }, [value, reasonCode, reasonText, isReasonActive]);

    const label =
        reasonCode && reasonText
            ? `${reasonCode} - ${reasonText}`
            : reasonText ?? null;

    const combobox = (
        <div className="space-y-2">
            <Combobox
                disabled={disabled || loading}
                state={error ? "error" : "default"}
                value={value}
                label={label}
                options={options}
                pinnedOptions={pinnedOptions}
                emptyStateText={loading ? "Loading reasons..." : "No reasons available"}
                noMatchesText="No matching reasons found"
                placeholder={loading ? "Loading reasons..." : "Select reason"}
                onChange={(nextValue, option) => {
                    onChange(nextValue, option?.data ?? null);
                }}
            />

            {showInactiveWarning && (
                <InactiveLookupWarning label="reason" variant="field" />
            )}
        </div>
    );

    if (hideLabel) {
        return combobox;
    }

    return (
        <Field required={required} label="Reason" error={error}>
            {combobox}
        </Field>
    );
}