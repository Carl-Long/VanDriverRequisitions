"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button/button";
import { IconButton } from "./button/icon-button";

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

    function getPageNumbers(): (number | "ellipsis")[] {
        const pages: (number | "ellipsis")[] = [];
        const delta = 1;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
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
            <IconButton
                size="md"
                tone="accent"
                aria-label="Previous page"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </IconButton>

            {getPageNumbers().map((p, idx) =>
                p === "ellipsis" ? (
                    <span
                        key={`ellipsis-${idx}`}
                        className="flex h-10 w-10 items-center justify-center text-sm text-muted-foreground"
                    >
                        …
                    </span>
                ) : (
                    <Button
                        key={p}
                        size="md"
                        variant={p === page ? "solid" : "ghost"}
                        tone={p === page ? "primary" : "accent"}
                        onClick={() => onPageChange(p)}
                        aria-current={p === page ? "page" : undefined}
                        className="h-10 min-w-10 px-0"
                    >
                        {p}
                    </Button>
                ),
            )}

            <IconButton
                size="md"
                tone="accent"
                aria-label="Next page"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </IconButton>
        </nav>
    );
}
