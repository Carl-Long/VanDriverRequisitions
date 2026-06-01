import { cn } from "@/lib/utils";

type Align = "left" | "center" | "right";

function getAlignClass(align: Align) {
    switch (align) {
        case "center":
            return "text-center";
        case "right":
            return "text-right";
        default:
            return "text-left";
    }
}

export function Table({
    className,
    ...props
}: React.HTMLAttributes<HTMLTableElement>) {
    return (
        <table
            className={cn(
                "w-full text-sm",
                className
            )}
            {...props}
        />
    );
}

export function TableHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <thead
            className={cn(
                "sticky top-0 z-10 border-b border-border bg-surface-elevated",
                className
            )}
            {...props}
        />
    );
}

export function TableBody({
    className,
    ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <tbody
            className={cn(
                "divide-y divide-border-subtle",
                className
            )}
            {...props}
        />
    );
}

export function TableHeaderRow({
    className,
    ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr
            className={cn(
                "text-xs font-semibold uppercase tracking-wide text-foreground",
                className
            )}
            {...props}
        />
    );
}

export function TableRow({
    className,
    ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr
            className={cn(
                "group transition-colors duration-150 hover:bg-surface-hover",
                className
            )}
            {...props}
        />
    );
}

type CellProps = React.HTMLAttributes<
    HTMLTableCellElement
> & {
    align?: Align;
    nowrap?: boolean;
};

export function TableHeaderCell({
    align = "left",
    nowrap = false,
    className,
    ...props
}: CellProps) {
    return (
        <th
            className={cn(
                "px-4 py-3",
                getAlignClass(align),
                nowrap && "whitespace-nowrap",
                className
            )}
            {...props}
        />
    );
}

export function TableCell({
    align = "left",
    nowrap = false,
    className,
    ...props
}: CellProps) {
    return (
        <td
            className={cn(
                "px-4 py-3 align-middle",
                getAlignClass(align),
                nowrap && "whitespace-nowrap",
                className
            )}
            {...props}
        />
    );
}

export function TableFooter({
    className,
    ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <tfoot
            className={cn(
                "border-t border-border bg-muted/20 font-semibold",
                className,
            )}
            {...props}
        />
    );
}