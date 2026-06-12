"use client";

import { useEffect, useState } from "react";

import { Field } from "@/components/ui/field/field";
import { Combobox } from "@/components/ui/field/combobox";
import { feReasonsApi, type FeReason } from "@/features/fe-reasons/fe-reasons-api";

type ReasonOption = {
    value: string;
    label: string;
};

type Props = {
    required?: boolean;
    disabled?: boolean;
    value: string | null;
    label: string | null;
    error?: string;
    hideLabel?: boolean;
    onChange: (value: string | null, label: string | null) => void;
};

let cachedReasonOptions: ReasonOption[] | null = null;
let pendingReasonOptionsRequest: Promise<ReasonOption[]> | null = null;

async function getCachedActiveReasonOptions() {
    if (cachedReasonOptions) {
        return cachedReasonOptions;
    }

    if (!pendingReasonOptionsRequest) {
        pendingReasonOptionsRequest = feReasonsApi
            .getAll(false)
            .then((reasons) => {
                cachedReasonOptions = toReasonOptions(reasons);
                return cachedReasonOptions;
            })
            .finally(() => {
                pendingReasonOptionsRequest = null;
            });
    }

    return pendingReasonOptionsRequest;
}

function toReasonOptions(reasons: FeReason[]): ReasonOption[] {
    return reasons
        .filter((reason) => reason.isActive)
        .map((reason) => ({
            value: reason.id,
            label: reason.reason,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

export function FeReasonField({
    required = false,
    disabled = false,
    value,
    label,
    error,
    hideLabel = false,
    onChange,
}: Readonly<Props>) {
    const [options, setOptions] = useState<ReasonOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadOptions() {
            setLoading(true);

            try {
                const result = await getCachedActiveReasonOptions();

                if (!cancelled) {
                    setOptions(result);
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
    }, []);

    const combobox = (
        <Combobox
            disabled={disabled || loading}
            state={error ? "error" : "default"}
            value={value}
            label={label}
            options={options}
            emptyStateText={loading ? "Loading reasons..." : "No reasons available"}
            noMatchesText="No matching reasons found"
            placeholder={loading ? "Loading reasons..." : "Select reason"}
            onChange={(value, option) => {
                onChange(value, option?.label ?? null);
            }}
        />
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