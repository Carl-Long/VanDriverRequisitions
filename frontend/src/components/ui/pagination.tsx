"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
};

export function Pagination({
    page,
    totalPages,
    onPageChange,
    className,
}: Readonly<PaginationProps>) {
    if (totalPages <= 1) return null;

    // Build page numbers: always show first, last, current, and neighbours
    function getPageNumbers(): (number | "ellipsis")[] {
        const pages: (number | "ellipsis")[] = [];
        const delta = 1;

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= page - delta && i <= page + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "ellipsis") {
                pages.push("ellipsis");
            }
        }

        return pages;
    }

    return (
        <nav
            aria-label="Pagination"
            className={cn("flex items-center justify-center gap-1", className)}
        >
            <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition",
                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                    "disabled:pointer-events-none disabled:opacity-40",
                )}
                aria-label="Previous page"
            >
                <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((p, idx) =>
                p === "ellipsis" ? (
                    <span
                        key={`ellipsis-${idx}`}
                        className="flex h-9 w-9 items-center justify-center text-xs text-muted-foreground"
                    >
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition",
                            p === page
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        aria-current={p === page ? "page" : undefined}
                    >
                        {p}
                    </button>
                ),
            )}

            <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition",
                    "text-muted-foreground hover:bg-muted hover:text-foreground",
                    "disabled:pointer-events-none disabled:opacity-40",
                )}
                aria-label="Next page"
            >
                <ChevronRight size={16} />
            </button>
        </nav>
    );
}
