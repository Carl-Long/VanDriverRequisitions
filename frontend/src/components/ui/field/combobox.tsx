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
    const triggerRef = useRef<HTMLButtonElement>(null);

    const maxVisibleOptions = 50;
    const hasSearch = search.trim().length > 0;

    const closeCombobox = useCallback((focusTrigger = false) => {
        setOpen(false);
        setSearch("");

        if (focusTrigger) {
            globalThis.requestAnimationFrame(() => {
                triggerRef.current?.focus();
            });
        }
    }, []);

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
                    "cursor-pointer flex items-center justify-between",

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
                    <div className="relative rounded-t-lg border-b border-border focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-inset overflow-hidden">
                        <Search
                            className="size-[0.95em] absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="h-10 w-full bg-transparent pl-9 pr-3 text-sm outline-none"
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                        {pinnedOptions.map((option) => {
                            const selected = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value, option);
                                        closeCombobox(true);
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                                    )}
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
                                        onClick={() => {
                                            onChange(option.value, option);
                                            closeCombobox(true);
                                        }}
                                        className={cn(
                                            "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                                        )}
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
                            <div
                                className={cn(
                                    "text-muted-foreground",
                                    pinnedOptions.length > 0
                                        ? "px-3 py-2 text-xs"
                                        : "px-3 py-4 text-sm",
                                )}
                            >
                                {hasSearch ? noMatchesText : emptyStateText}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
