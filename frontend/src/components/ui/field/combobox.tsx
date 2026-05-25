"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboboxOption<T> = {
    value: string;
    label: string;
    description?: string;
    data: T;
};

type ComboboxProps<T> = {
    value: string | null;
    selectedLabel?: string | null;
    placeholder?: string;
    disabled?: boolean;
    invalid?: boolean;
    onChange: (value: string | null, data: T | null) => void;
    fetchOptions: (search: string) => Promise<ComboboxOption<T>[]>;
    renderOption?: (option: ComboboxOption<T>) => ReactNode;
    emptyMessage?: string;
    id?: string;
};

const DEBOUNCE_MS = 250;

export function Combobox<T>({
    value,
    selectedLabel,
    placeholder = "Search…",
    disabled,
    invalid,
    onChange,
    fetchOptions,
    renderOption,
    emptyMessage = "No matches",
    id,
}: Readonly<ComboboxProps<T>>) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [options, setOptions] = useState<ComboboxOption<T>[]>([]);
    const [loading, setLoading] = useState(false);
    const [highlighted, setHighlighted] = useState(0);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [search]);

    // Fetch when open & search changes
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setLoading(true);
        fetchOptions(debounced)
            .then((opts) => {
                if (cancelled) return;
                setOptions(opts);
                setHighlighted(0);
            })
            .catch(() => {
                if (cancelled) return;
                setOptions([]);
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, debounced, fetchOptions]);

    // Outside click closes
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (!wrapperRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    const handleOpen = useCallback(() => {
        if (disabled) return;
        setOpen(true);
        setSearch("");
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [disabled]);

    const handleSelect = useCallback(
        (opt: ComboboxOption<T>) => {
            onChange(opt.value, opt.data);
            setOpen(false);
            setSearch("");
        },
        [onChange],
    );

    const handleClear = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onChange(null, null);
        },
        [onChange],
    );

    const display = useMemo(() => {
        if (value && selectedLabel) return selectedLabel;
        return null;
    }, [value, selectedLabel]);

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((h) => Math.min(h + 1, options.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const opt = options[highlighted];
            if (opt) handleSelect(opt);
        } else if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
        }
    }

    return (
        <div ref={wrapperRef} className="relative">
            <button
                id={id}
                type="button"
                onClick={open ? () => setOpen(false) : handleOpen}
                disabled={disabled}
                className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm",
                    "bg-surface text-foreground transition",
                    "focus:outline-none focus:ring-2 focus:ring-ring/20",
                    invalid
                        ? "border-red-500/60 focus:border-red-500"
                        : "border-border focus:border-primary/30",
                    disabled && "opacity-50 cursor-not-allowed",
                    display && !disabled ? "pr-14" : "pr-9",
                )}
            >
                <span className={cn("truncate", !display && "text-muted-foreground")}>
                    {display ?? placeholder}
                </span>
            </button>

            {/* Clear and chevron — siblings of the trigger, absolutely positioned */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 gap-0.5">
                {display && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="pointer-events-auto rounded p-0.5 text-muted-foreground transition hover:text-foreground"
                        aria-label="Clear"
                    >
                        ×
                    </button>
                )}
                <ChevronDown
                    size={16}
                    className={cn(
                        "text-muted-foreground transition-transform",
                        open && "rotate-180",
                    )}
                />
            </div>

            {open && (
                <div
                    className={cn(
                        "absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-surface shadow-lg",
                    )}
                >
                    <div className="relative border-b border-border">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Search…"
                            className="w-full bg-transparent py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        />
                    </div>
                    <ul className="max-h-64 overflow-y-auto py-1">
                        {loading && (
                            <li className="flex items-center justify-center px-3 py-3 text-sm text-muted-foreground">
                                <Loader2 size={14} className="mr-2 animate-spin" />
                                Loading…
                            </li>
                        )}
                        {!loading && options.length === 0 && (
                            <li className="px-3 py-3 text-sm text-muted-foreground">
                                {emptyMessage}
                            </li>
                        )}
                        {!loading &&
                            options.map((opt, i) => {
                                const selected = opt.value === value;
                                return (
                                    <li key={opt.value}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(opt)}
                                            onMouseEnter={() => setHighlighted(i)}
                                            className={cn(
                                                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition",
                                                i === highlighted && "bg-muted",
                                            )}
                                        >
                                            <Check
                                                size={14}
                                                className={cn(
                                                    "shrink-0 text-primary",
                                                    !selected && "invisible",
                                                )}
                                            />
                                            <div className="min-w-0 flex-1">
                                                {renderOption ? (
                                                    renderOption(opt)
                                                ) : (
                                                    <span className="truncate text-foreground">
                                                        {opt.label}
                                                    </span>
                                                )}
                                                {opt.description && !renderOption && (
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {opt.description}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            )}
        </div>
    );
}