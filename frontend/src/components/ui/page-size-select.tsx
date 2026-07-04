"use client";

import { useMemo } from "react";

import { Combobox, type ComboboxOption } from "@/components/ui/field/combobox";

type PageSizeSelectProps = {
    pageSize: number;
    options: readonly number[];
    onPageSizeChange: (pageSize: number) => void;
};

export function PageSizeSelect({
    pageSize,
    options,
    onPageSizeChange,
}: Readonly<PageSizeSelectProps>) {
    const comboboxOptions = useMemo<ComboboxOption[]>(
        () =>
            options.map((option) => ({
                value: String(option),
                label: String(option),
            })),
        [options],
    );

    return (
        <Combobox
            value={String(pageSize)}
            label={`Rows per page: ${pageSize}`}
            options={comboboxOptions}
            placeholder="Rows per page"
            emptyStateText="No page sizes available"
            noMatchesText="No matching page size found"
            onChange={(value) => {
                if (!value) {
                    return;
                }

                onPageSizeChange(Number(value));
            }}
        />
    );
}