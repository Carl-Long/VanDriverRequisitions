"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/field/field";
import { Input } from "@/components/ui/field/input";
import { cn } from "@/lib/utils";
import { formatMoneyInputValue, normaliseMoneyInputValue, parseMoneyInputValue, } from "@/lib/format/currency";

type Props = {
    value: number | null;
    defaultValue?: number | null;
    error?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    inputWrapperClassName?: string;
    onChange: (value: number | null) => void;
    onClearError?: () => void;
};


export function RatePerMileField({
    value,
    defaultValue,
    error,
    label = "Rate Per Mile (£)",
    required = true,
    disabled = false,
    inputWrapperClassName,
    onChange,
    onClearError,
}: Readonly<Props>) {
    const userClearedRef = useRef(false);
    const isEditingRef = useRef(false);

    const [displayValue, setDisplayValue] = useState(() => formatMoneyInputValue(value));

    useEffect(() => {
        if (disabled) {
            userClearedRef.current = false;
            return;
        }

        if (value !== null && value !== undefined) {
            userClearedRef.current = false;
            return;
        }

        if (userClearedRef.current) {
            return;
        }

        if (defaultValue !== null && defaultValue !== undefined) {
            onChange(defaultValue);
        }
    }, [defaultValue, disabled, onChange, value]);

    useEffect(() => {
        if (isEditingRef.current) {
            return;
        }

        setDisplayValue(formatMoneyInputValue(value));
    }, [value]);

    return (
        <Field label={label} required={required} error={error}>
            <div className={cn(inputWrapperClassName)}>
                <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={displayValue}
                    state={error ? "error" : "default"}
                    disabled={disabled}
                    onFocus={() => {
                        isEditingRef.current = true;
                    }}
                    onBlur={() => {
                        isEditingRef.current = false;

                        const parsed = parseMoneyInputValue(displayValue);
                        const normalised = normaliseMoneyInputValue(parsed);

                        setDisplayValue(formatMoneyInputValue(normalised));

                        if (normalised !== value) {
                            onChange(normalised);
                            onClearError?.();
                        }
                    }}
                    onChange={(event) => {
                        const nextDisplayValue = event.target.value;
                        const nextValue = parseMoneyInputValue(nextDisplayValue);
                        setDisplayValue(nextDisplayValue);

                        userClearedRef.current = nextValue === null;

                        onChange(nextValue);
                        onClearError?.();
                    }}
                />
            </div>
        </Field>
    );
}