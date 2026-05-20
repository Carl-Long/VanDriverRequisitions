"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
};

export function SearchInput({
    value,
    onChange,
    placeholder = "Search...",
    className,
}: Readonly<SearchInputProps>) {
    return (
        <div className={cn("relative", className)}>
            <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3",
                    "text-sm text-foreground placeholder:text-muted-foreground",
                    "focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring/20",
                    "transition-colors",
                )}
            />
        </div>
    );
}
