import type { ComponentProps, ReactNode } from "react";

import { TableCell, TableHeaderCell, } from "@/components/ui/table/table";
import { cn } from "@/lib/utils";

type TableContainerProps = {
    children: ReactNode;
    maxHeightClassName?: string;
    className?: string;
};

export function RequisitionTableContainer({
    children,
    maxHeightClassName = "max-h-[55vh]",
    className,
}: Readonly<TableContainerProps>) {
    return (
        <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface", className)}>
            <div className={cn(maxHeightClassName, "overflow-auto")}>
                {children}
            </div>
        </div>
    );
}

type HeaderCellProps = ComponentProps<typeof TableHeaderCell>;

export function RequisitionStickyHeaderCell({
    className,
    ...props
}: Readonly<HeaderCellProps>) {
    return (
        <TableHeaderCell
            className={cn("sticky top-0 z-20 bg-surface-elevated", className)}
            {...props}
        />
    );
}

type FooterCellProps = ComponentProps<typeof TableCell>;

export function RequisitionStickyFooterCell({
    className,
    ...props
}: Readonly<FooterCellProps>) {
    return (
        <TableCell
            className={cn("sticky bottom-0 z-20 bg-surface-elevated", className)}
            {...props}
        />
    );
}

type ActionHeaderCellProps = {
    readonly: boolean;
    label?: string;
};

export function RequisitionRowActionHeaderCell({
    readonly,
    label = "Delete",
}: Readonly<ActionHeaderCellProps>) {
    if (readonly) {
        return null;
    }

    return (
        <RequisitionStickyHeaderCell align="right" nowrap>
            {label}
        </RequisitionStickyHeaderCell>
    );
}

type ActionCellProps = {
    readonly: boolean;
    children: ReactNode;
};

export function RequisitionRowActionCell({
    readonly,
    children,
}: Readonly<ActionCellProps>) {
    if (readonly) {
        return null;
    }

    return (
        <TableCell align="right" nowrap>
            <div className="flex justify-end gap-2">{children}</div>
        </TableCell>
    );
}