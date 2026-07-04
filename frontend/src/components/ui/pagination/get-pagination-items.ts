export type PaginationItem = number | "ellipsis";

const visiblePageWindowSize = 5;
const maxPagesWithoutEllipsis = 7;

export function getPaginationItems(
    page: number,
    totalPages: number,
): PaginationItem[] {
    if (totalPages <= 0) {
        return [];
    }

    const currentPage = clamp(page, 1, totalPages);

    if (totalPages <= maxPagesWithoutEllipsis) {
        return createPageRange(1, totalPages);
    }

    const halfWindow = Math.floor(visiblePageWindowSize / 2);

    let windowStart = currentPage - halfWindow;
    let windowEnd = currentPage + halfWindow;

    if (windowStart <= 1) {
        windowStart = 1;
        windowEnd = visiblePageWindowSize;
    }

    if (windowEnd >= totalPages) {
        windowEnd = totalPages;
        windowStart = totalPages - visiblePageWindowSize + 1;
    }

    const items: PaginationItem[] = [];

    if (windowStart > 1) {
        items.push(1);

        if (windowStart > 2) {
            items.push("ellipsis");
        }
    }

    items.push(...createPageRange(windowStart, windowEnd));

    if (windowEnd < totalPages) {
        if (windowEnd < totalPages - 1) {
            items.push("ellipsis");
        }

        items.push(totalPages);
    }

    return items;
}

function createPageRange(start: number, end: number): number[] {
    return Array.from(
        { length: end - start + 1 },
        (_, index) => start + index,
    );
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}