"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Check,
    ChevronDown,
    Loader2,
    Search,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type ComboboxOption = {
    value: string;
    label: string;
};

type Props = {
    value: string | null;
    label?: string | null;
    placeholder?: string;
    options?: ComboboxOption[];
    onSearch?: (
        search: string,
    ) => Promise<ComboboxOption[]>;
    onChange: (
        value: string | null,
        option: ComboboxOption | null,
    ) => void;
};

export function Combobox({
    value,
    label,
    placeholder = "Select...",
    options = [],
    onSearch,
    onChange,
}: Readonly<Props>) {
    const [open, setOpen] = useState(false);

    const [search, setSearch] = useState("");

    const [asyncOptions, setAsyncOptions] = useState<
        ComboboxOption[]
    >([]);

    const [loading, setLoading] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    const finalOptions = useMemo(() => {
        if (onSearch) {
            return asyncOptions;
        }

        if (!search) {
            return options;
        }

        return options.filter((x) =>
            x.label
                .toLowerCase()
                .includes(search.toLowerCase()),
        );
    }, [
        options,
        search,
        asyncOptions,
        onSearch,
    ]);

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
            if (
                !wrapperRef.current?.contains(
                    e.target as Node,
                )
            ) {
                setOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClick,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClick,
            );
        };
    }, []);

    return (
        <div
            ref={wrapperRef}
            className="relative"
        >
            <button
                type="button"
                onClick={() =>
                    setOpen((prev) => !prev)
                }
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-lg border border-border bg-surface px-3 text-sm",
                )}
            >
                <span
                    className={cn(
                        "truncate",
                        !label &&
                        "text-muted-foreground",
                    )}
                >
                    {label ?? placeholder}
                </span>

                <ChevronDown size={16} />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-background shadow-lg">
                    <div className="relative border-b border-border">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value,
                                )
                            }
                            placeholder="Search..."
                            className="h-10 w-full bg-transparent pl-9 pr-3 text-sm outline-none"
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                        {loading && (
                            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                                <Loader2
                                    size={14}
                                    className="animate-spin"
                                />
                                Loading...
                            </div>
                        )}

                        {!loading &&
                            finalOptions.map(
                                (option) => {
                                    const selected =
                                        option.value ===
                                        value;

                                    return (
                                        <button
                                            key={
                                                option.value
                                            }
                                            type="button"
                                            onClick={() => {
                                                onChange(
                                                    option.value,
                                                    option,
                                                );

                                                setOpen(
                                                    false,
                                                );
                                            }}
                                            className={cn(
                                                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted",
                                            )}
                                        >
                                            <Check
                                                size={14}
                                                className={cn(
                                                    selected
                                                        ? "opacity-100"
                                                        : "opacity-0",
                                                )}
                                            />

                                            <span className="truncate">
                                                {
                                                    option.label
                                                }
                                            </span>
                                        </button>
                                    );
                                },
                            )}

                        {!loading &&
                            finalOptions.length ===
                            0 && (
                                <div className="px-3 py-4 text-sm text-muted-foreground">
                                    No results
                                </div>
                            )}
                    </div>
                </div>
            )}
        </div>
    );
}