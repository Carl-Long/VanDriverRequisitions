"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    searchable?: boolean;
    state?: "default" | "error";
    value: string | null;
    label?: string | null;
    placeholder?: string;
    noMatchesText?: string;
    emptyStateText?: string;
    options?: ComboboxOption<TData>[];
    pinnedOptions?: ComboboxOption<TData>[];
    searchDebounceMs?: number;
    onSearch?: (search: string) => Promise<ComboboxOption<TData>[]>;
    onChange: (value: string | null, option: ComboboxOption<TData> | null) => void;
};

export function Combobox<TData = unknown>({
    disabled = false,
    searchable = true,
    state = "default",
    value,
    label,
    placeholder = "Select...",
    options = [],
    pinnedOptions = [],
    emptyStateText = "No options available",
    noMatchesText = "No matching results",
    searchDebounceMs = 0,
    onSearch,
    onChange,
}: Readonly<Props<TData>>) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [asyncOptions, setAsyncOptions] = useState<ComboboxOption<TData>[]>([]);
    const [loading, setLoading] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const maxVisibleOptions = 50;
    const isSearchEnabled = searchable || Boolean(onSearch);
    const hasSearch = isSearchEnabled && search.trim().length > 0;

    const emptyResultsMessage = hasSearch ? noMatchesText : emptyStateText;

    const emptyResultsClassName = cn(
        "text-muted-foreground",
        getEmptyResultsSpacingClassName(pinnedOptions.length > 0),
    );

    const closeCombobox = useCallback((focusTrigger = false) => {
        setOpen(false);
        setSearch("");

        if (focusTrigger) {
            globalThis.requestAnimationFrame(() => {
                triggerRef.current?.focus();
            });
        }
    }, []);

    const selectOption = useCallback(
        (option: ComboboxOption<TData>) => {
            onChange(option.value, option);
            closeCombobox(true);
        },
        [onChange, closeCombobox],
    );

    const finalOptions = useMemo(() => {
        if (onSearch) {
            return asyncOptions.slice(0, maxVisibleOptions);
        }

        if (!hasSearch) {
            return options.slice(0, maxVisibleOptions);
        }

        const normalisedSearch = search.toLowerCase();

        return options
            .filter((x) => x.label.toLowerCase().includes(normalisedSearch))
            .slice(0, maxVisibleOptions);
    }, [options, search, asyncOptions, onSearch, hasSearch]);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleDocumentKeyDown(event: KeyboardEvent) {
            if (event.key !== "Escape") {
                return;
            }

            const target = event.target as Node | null;

            if (!target || !wrapperRef.current?.contains(target)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            closeCombobox(true);
        }

        function handleDocumentOutsideInteraction(event: Event) {
            const target = event.target as Node | null;

            if (!target || !wrapperRef.current?.contains(target)) {
                closeCombobox(false);
            }
        }

        document.addEventListener("keydown", handleDocumentKeyDown, true);
        document.addEventListener("mousedown", handleDocumentOutsideInteraction);
        document.addEventListener("focusin", handleDocumentOutsideInteraction);

        return () => {
            document.removeEventListener("keydown", handleDocumentKeyDown, true);
            document.removeEventListener("mousedown", handleDocumentOutsideInteraction);
            document.removeEventListener("focusin", handleDocumentOutsideInteraction);
        };
    }, [open, closeCombobox]);

    useEffect(() => {
        if (!open || !onSearch) {
            return;
        }

        const delay = getSearchDelay(search, searchDebounceMs);
        const searchFn = onSearch;
        let cancelled = false;

        const timeoutId = globalThis.setTimeout(() => {
            if (!cancelled) {
                setLoading(true);
            }

            void runAsyncSearch(
                searchFn,
                search,
                (results) => {
                    if (!cancelled) {
                        setAsyncOptions(results);
                    }
                },
                () => {
                    if (!cancelled) {
                        setLoading(false);
                    }
                },
            );
        }, delay);

        return () => {
            cancelled = true;
            globalThis.clearTimeout(timeoutId);
        };
    }, [search, onSearch, open, searchDebounceMs]);

    return (
        <div ref={wrapperRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => {
                    if (disabled) {
                        return;
                    }

                    setOpen((prev) => !prev);
                }}
                className={cn(
                    fieldBase,
                    "flex cursor-pointer items-center justify-between",
                    state === "error" && "border-danger ring-1 ring-danger/30",
                    disabled && "cursor-not-allowed opacity-60",
                )}
            >
                <span className={cn("truncate", !label && "text-muted-foreground")}>
                    {label ?? placeholder}
                </span>

                <ChevronDown className="size-[1em]" />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-background shadow-lg">
                    {isSearchEnabled && (
                        <div className="relative overflow-hidden rounded-t-lg border-b border-border focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-inset">
                            <Search className="absolute left-3 top-1/2 size-[0.95em] -translate-y-1/2 text-muted-foreground" />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="h-10 w-full bg-transparent pl-9 pr-3 text-sm outline-none"
                            />
                        </div>
                    )}

                    <div className="max-h-64 overflow-y-auto py-1">
                        {pinnedOptions.map((option) => {
                            const selected = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => selectOption(option)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                                >
                                    <Check
                                        className={cn(
                                            "size-[1em]",
                                            selected ? "opacity-100" : "opacity-0",
                                        )}
                                    />

                                    <span className="truncate">{option.label}</span>
                                </button>
                            );
                        })}

                        {pinnedOptions.length > 0 && finalOptions.length > 0 && (
                            <div className="my-1 border-t border-border" />
                        )}

                        {loading && (
                            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                                <Loader2 className="size-[1em] animate-spin" />
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
                                        onClick={() => selectOption(option)}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                                    >
                                        <Check
                                            className={cn(
                                                "size-[1em]",
                                                selected ? "opacity-100" : "opacity-0",
                                            )}
                                        />

                                        <span className="truncate">{option.label}</span>
                                    </button>
                                );
                            })}

                        {!loading && finalOptions.length === 0 && (
                            <div className={emptyResultsClassName}>
                                {emptyResultsMessage}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function getSearchDelay(search: string, searchDebounceMs: number) {
    if (search.trim().length === 0) {
        return 0;
    }

    return searchDebounceMs;
}

function getEmptyResultsSpacingClassName(hasPinnedOptions: boolean) {
    if (hasPinnedOptions) {
        return "px-3 py-2 text-xs";
    }

    return "px-3 py-4 text-sm";
}

async function runAsyncSearch<TData>(
    searchFn: (search: string) => Promise<ComboboxOption<TData>[]>,
    search: string,
    onSuccess: (results: ComboboxOption<TData>[]) => void,
    onFinally: () => void,
) {
    try {
        const results = await searchFn(search);
        onSuccess(results);
    } finally {
        onFinally();
    }
}