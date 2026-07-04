"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { getPaginationItems } from "./get-pagination-items";
import { Button } from "../button/button";
import { IconButton } from "../button/icon-button";

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
    if (totalPages <= 1) {
        return null;
    }

    const items = getPaginationItems(page, totalPages);

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
                <ChevronLeft className="size-[1em]" />
            </IconButton>

            {items.map((item, index) => {
                if (item === "ellipsis") {
                    const previousItem = items[index - 1];
                    const nextItem = items[index + 1];

                    return (
                        <span
                            key={`ellipsis-${previousItem}-${nextItem}`}
                            className="flex h-10 w-10 items-center justify-center text-sm text-muted-foreground"
                        >
                            …
                        </span>
                    );
                }

                return (
                    <Button
                        key={item}
                        size="md"
                        variant={item === page ? "solid" : "ghost"}
                        tone={item === page ? "primary" : "accent"}
                        onClick={() => onPageChange(item)}
                        aria-current={item === page ? "page" : undefined}
                        className="h-10 min-w-10 px-0"
                    >
                        {item}
                    </Button>
                );
            })}

            <IconButton
                size="md"
                tone="accent"
                aria-label="Next page"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
            >
                <ChevronRight className="size-[1em]" />
            </IconButton>
        </nav>
    );
}