import { Pencil, Trash2 } from "lucide-react";

import { Surface } from "@/components/ui/surface";
import { IconButton } from "@/components/ui/button/icon-button";

import type { SubmitWindow } from "@/lib/api/submit-windows";
import { cn } from "@/lib/utils";

type Props = {
    items: SubmitWindow[];
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
        className: "bg-blue-500/10 text-blue-600",
    },
    open: {
        label: "Open",
        className: "bg-emerald-500/10 text-emerald-600",
    },
    closed: {
        label: "Closed",
        className: "bg-muted text-muted-foreground",
    },
    deleted: {
        label: "Deleted",
        className: "bg-red-500/10 text-red-600",
    },
};

function StatusPill({
    status,
}: Readonly<{ status: WindowStatus }>) {
    const config = statusConfig[status];

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function SubmitWindowTable({
    items,
    onEdit,
    onDelete
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-border bg-surface-elevated">
                    <tr className="bg-accent/10 text-xs font-semibold uppercase tracking-wide text-foreground">
                        <th className="px-4 py-3">Open From</th>
                        <th className="px-4 py-3">Open To</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Created By</th>
                        <th className="px-4 py-3 text-right">
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-border-subtle">
                    {items.map((item) => {
                        const status = getWindowStatus(item);

                        return (
                            <tr
                                key={item.id}
                                className={cn(
                                    "group transition-colors duration-150 hover:bg-surface-hover",
                                    item.isDeleted &&
                                    "bg-red-500/5 opacity-60",
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
                                    <span className="text-sm text-muted-foreground">
                                        {item.createdByNameSnapshot ??
                                            "System"}
                                    </span>
                                </td>

                                <td className="px-4 py-3 align-middle text-right">
                                    <div className="flex justify-end gap-2">
                                        <IconButton
                                            onClick={() => onEdit(item)}
                                        >
                                            <Pencil size={14} />
                                            Edit
                                        </IconButton>

                                        {!item.isDeleted && (
                                            <IconButton
                                                onClick={() => onDelete(item)}
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </IconButton>
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