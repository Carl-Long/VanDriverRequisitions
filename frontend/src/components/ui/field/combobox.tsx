"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Check, ChevronDown, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { fieldBase } from "./fieldstyles";

export type ComboboxOption<TData = unknown> = {
    value: string;
    label: string;
    data?: TData;
};

type Props<TData = unknown> = {
    disabled?: boolean;
    state?: "default" | "error";
    value: string | null;
    label?: string | null;
    placeholder?: string;
    noMatchesText?: string;
    emptyStateText?: string;
    options?: ComboboxOption<TData>[];
    pinnedOptions?: ComboboxOption<TData>[];
    onSearch?: (search: string) => Promise<ComboboxOption<TData>[]>;
    onChange: (value: string | null, option: ComboboxOption<TData> | null) => void;
};

export function Combobox<TData = unknown>({
    disabled = false,
    state = "default",
    value,
    label,
    placeholder = "Select...",
    options = [],
    pinnedOptions = [],
    emptyStateText = "No options available",
    noMatchesText = "No matching results",
    onSearch,
    onChange,
}: Readonly<Props<TData>>) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [asyncOptions, setAsyncOptions] = useState<ComboboxOption<TData>[]>([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const maxVisibleOptions = 50;

    const finalOptions = useMemo(() => {
        if (onSearch) {
            return asyncOptions.slice(0, maxVisibleOptions);
        }

        if (!search) {
            return options.slice(0, maxVisibleOptions);
        }

        const normalisedSearch = search.toLowerCase();

        return options
            .filter((x) => x.label.toLowerCase().includes(normalisedSearch))
            .slice(0, maxVisibleOptions);
    }, [options, search, asyncOptions, onSearch]);

    useEffect(() => {
        if (!open) return;

        if (!onSearch) return;

        const searchFn = onSearch;

        let cancelled = false;

        async function run() {
            setLoading(true);

            try {
                const results = await searchFn(search);

                if (!cancelled) {
                    setAsyncOptions(results);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [search, onSearch, open]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => {
                    if (disabled) {
                        return;
                    }

                    setOpen((prev) => !prev);
                }}
                className={cn(
                    fieldBase,
                    "cursor-pointer flex items-center justify-between",

                    state === "error" && "border-danger ring-1 ring-danger/30",

                    disabled && "cursor-not-allowed opacity-60",
                )}
            >
                <span className={cn("truncate", !label && "text-muted-foreground")}>
                    {label ?? placeholder}
                </span>

                <ChevronDown size={16} />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-background shadow-lg">
                    <div className="relative rounded-t-lg border-b border-border focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-inset overflow-hidden">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="h-10 w-full bg-transparent pl-9 pr-3 text-sm outline-none"
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                        {/* Pinned options */}
                        {pinnedOptions.map((option) => {
                            const selected = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value, option);

                                        setOpen(false);
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                                    )}
                                >
                                    <Check
                                        size={14}
                                        className={cn(selected ? "opacity-100" : "opacity-0")}
                                    />

                                    <span className="truncate">{option.label}</span>
                                </button>
                            );
                        })}

                        {/* Divider */}
                        {pinnedOptions.length > 0 && finalOptions.length > 0 && (
                            <div className="my-1 border-t border-border" />
                        )}

                        {/* Async / normal options */}
                        {loading && (
                            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                                <Loader2 size={14} className="animate-spin" />
                                Loading...
                            </div>
                        )}

                        {!loading &&
                            finalOptions.map((option) => {
                                const selected = option.value === value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value, option);

                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                                        )}
                                    >
                                        <Check
                                            size={14}
                                            className={cn(selected ? "opacity-100" : "opacity-0")}
                                        />

                                        <span className="truncate">{option.label}</span>
                                    </button>
                                );
                            })}

                        {!loading && pinnedOptions.length === 0 && finalOptions.length === 0 && (
                            <div className="px-3 py-4 text-sm text-muted-foreground">
                                {emptyStateText}
                            </div>
                        )}

                        {!loading && pinnedOptions.length > 0 && finalOptions.length === 0 && (
                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                {noMatchesText}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
