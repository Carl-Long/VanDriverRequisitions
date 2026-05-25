import { Pencil, Trash2 } from "lucide-react";

import { Surface } from "@/components/ui/surface";
import { IconButton } from "@/components/ui/button/icon-button";

import type {
    SubmitWindow,
    SubmitWindowFilter,
} from "@/lib/api/submit-windows";

import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format/date";

type Props = {
    items: SubmitWindow[];
    filter: SubmitWindowFilter;
    onEdit: (item: SubmitWindow) => void;
    onDelete: (item: SubmitWindow) => void;
};

type WindowStatus = "upcoming" | "open" | "closed" | "deleted";

function getWindowStatus(window: SubmitWindow): WindowStatus {
    if (window.isDeleted) return "deleted";

    const now = new Date();
    const from = new Date(window.openFrom);
    const to = new Date(window.openTo);

    if (now < from) return "upcoming";
    if (now >= from && now <= to) return "open";

    return "closed";
}

const statusConfig: Record<
    WindowStatus,
    { label: string; className: string }
> = {
    upcoming: {
        label: "Upcoming",
        className:
            "bg-info-surface text-info border-info-border",
    },
    open: {
        label: "Open",
        className:
            "bg-success-surface text-success border-success-border",
    },
    closed: {
        label: "Closed",
        className:
            "bg-surface-subtle text-muted-foreground",
    },
    deleted: {
        label: "Deleted",
        className:
            "bg-danger-surface text-danger border-danger-border",
    },
};

function StatusPill({
    status,
}: Readonly<{ status: WindowStatus }>) {
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

export function SubmitWindowTable({
    items,
    filter,
    onEdit,
    onDelete,
}: Readonly<Props>) {
    const isDeletedView = filter === "deleted";

    return (
        <Surface className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-border bg-surface-elevated">
                    <tr className="bg-accent/10 text-xs font-semibold uppercase tracking-wide text-foreground">
                        <th className="px-4 py-3">Open From</th>

                        <th className="px-4 py-3">Open To</th>

                        <th className="px-4 py-3">Status</th>

                        <th className="px-4 py-3">
                            {isDeletedView ? "Deleted" : "Last Modified"}
                        </th>

                        <th className="px-4 py-3 text-center">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-border-subtle">
                    {items.map((item) => {
                        const status = getWindowStatus(item);

                        const canManage =
                            status === "upcoming" || status === "open";

                        const metaDate = isDeletedView
                            ? item.deletedAtUtc
                            : item.updatedAtUtc ?? item.createdAtUtc;

                        const metaUser = isDeletedView
                            ? item.deletedByNameSnapshot
                            : item.updatedByNameSnapshot ??
                            item.createdByNameSnapshot ??
                            "System";

                        return (
                            <tr
                                key={item.id}
                                className={cn(
                                    "group transition-colors duration-150 hover:bg-surface-hover",
                                    item.isDeleted &&
                                    "bg-danger-surface opacity-60",
                                )}
                            >
                                <td className="px-4 py-3 align-middle text-foreground">
                                    {formatDateTime(item.openFrom)}
                                </td>

                                <td className="px-4 py-3 align-middle text-foreground">
                                    {formatDateTime(item.openTo)}
                                </td>

                                <td className="px-4 py-3 align-middle">
                                    <StatusPill status={status} />
                                </td>

                                <td className="px-4 py-3 align-middle">
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm text-foreground">
                                            {formatDateTime(metaDate) ?? "—"}
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            {metaUser ?? "System"}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-3 align-middle">
                                    <div className="flex justify-center gap-2">
                                        {canManage && (
                                            <>
                                                <IconButton
                                                    onClick={() => onEdit(item)}
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </IconButton>

                                                <IconButton
                                                    className="text-danger"
                                                    onClick={() => onDelete(item)}
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </IconButton>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Surface>
    );
}