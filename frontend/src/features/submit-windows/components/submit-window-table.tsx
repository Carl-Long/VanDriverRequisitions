import { Pencil, Trash2 } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { IconButton } from "@/components/ui/button/icon-button";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format/date";
import {
    TableHeader,
    TableHeaderRow,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/table/table";
import { SubmitWindow, SubmitWindowFilter } from "../types/submit-window.types";
import { getWindowStatus, WindowStatus } from "../utils/get-window-status";

type Props = {
    items: SubmitWindow[];
    filter: SubmitWindowFilter;
    onEdit: (item: SubmitWindow) => void;
    onDelete: (item: SubmitWindow) => void;
};

const statusConfig: Record<WindowStatus, { label: string; className: string }> = {
    upcoming: {
        label: "Upcoming",
        className: "bg-info-surface text-info border-info-border",
    },
    open: {
        label: "Open",
        className: "bg-success-surface text-success border-success-border",
    },
    closed: {
        label: "Closed",
        className: "bg-surface-subtle text-muted-foreground",
    },
    deleted: {
        label: "Deleted",
        className: "bg-danger-surface text-danger border-danger-border",
    },
};

function StatusPill({ status }: Readonly<{ status: WindowStatus }>) {
    const config = statusConfig[status];

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}

export function SubmitWindowTable({ items, filter, onEdit, onDelete }: Readonly<Props>) {
    const isDeletedView = filter === "deleted";

    return (
        <Surface className="overflow-x-auto">
            <table className="w-full text-sm">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Open From</TableHeaderCell>
                        <TableHeaderCell>Open To</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>
                            {isDeletedView ? "Deleted" : "Last Activity"}
                        </TableHeaderCell>
                        <TableHeaderCell align="center" nowrap>
                            Actions
                        </TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {items.map((item) => {
                        const status = getWindowStatus(item);

                        const canManage = status === "upcoming" || status === "open";

                        const metaDate = isDeletedView
                            ? item.deletedAtUtc
                            : (item.updatedAtUtc ?? item.createdAtUtc);

                        const metaUser = isDeletedView
                            ? item.deletedByNameSnapshot
                            : (item.updatedByNameSnapshot ??
                              item.createdByNameSnapshot ??
                              "System");

                        return (
                            <TableRow
                                key={item.id}
                                className={cn(item.isDeleted && "bg-danger-surface opacity-60")}
                            >
                                <TableCell className="text-foreground">
                                    {formatDateTime(item.openFrom)}
                                </TableCell>

                                <TableCell className="text-foreground">
                                    {formatDateTime(item.openTo)}
                                </TableCell>

                                <TableCell>
                                    <StatusPill status={status} />
                                </TableCell>

                                <TableCell>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm text-foreground">
                                            {formatDateTime(metaDate) ?? "—"}
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            {metaUser}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell align="center" nowrap>
                                    <div className="flex justify-center gap-2">
                                        {canManage && (
                                            <>
                                                <IconButton
                                                    variant="ghost"
                                                    tone="accent"
                                                    size="sm"
                                                    onClick={() => onEdit(item)}
                                                    aria-label="Edit"
                                                >
                                                    <Pencil size={14} />
                                                </IconButton>

                                                <IconButton
                                                    variant="ghost"
                                                    tone="danger"
                                                    size="sm"
                                                    onClick={() => onDelete(item)}
                                                    aria-label="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </IconButton>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </table>
        </Surface>
    );
}
