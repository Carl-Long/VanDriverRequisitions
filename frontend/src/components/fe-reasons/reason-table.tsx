import { Pencil } from "lucide-react";

import { FeReason } from "@/lib/api/fe-reasons";
import { IconButton } from "@/components/ui/button/icon-button";
import { Surface } from "@/components/ui/surface";
import { Toggle } from "@/components/ui/toggle";

import { formatDateGB } from "@/lib/format/date";

type Props = {
    items: FeReason[];
    onEdit: (item: FeReason) => void;
    onToggleActive: (item: FeReason) => void;
};

export function FeReasonsTable({
    items,
    onEdit,
    onToggleActive,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                {/* HEADER */}
                <thead className="sticky top-0 z-10 bg-surface-elevated border-b border-border">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-foreground bg-accent/10">
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Active</th>
                        <th className="px-4 py-3">Last modified</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-border-subtle">
                    {items.map((item) => {
                        const lastDate =
                            item.updatedAtUtc ?? item.createdAtUtc;

                        const lastUser =
                            item.updatedByNameSnapshot ??
                            item.createdByNameSnapshot ??
                            "System";

                        return (
                            <tr
                                key={item.id}
                                className="group transition-colors duration-150 hover:bg-surface-hover"
                            >
                                {/* Reason */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="font-medium text-foreground">
                                        {item.reason}
                                    </div>
                                </td>

                                {/* Active */}
                                <td className="px-4 py-3 align-middle">
                                    <Toggle
                                        checked={item.isActive}
                                        onChange={() => onToggleActive(item)}
                                        ariaLabel={`Toggle active for ${item.reason}`}
                                    />
                                </td>

                                {/* Last Modified */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm text-foreground">
                                            {formatDateGB(lastDate) ?? "—"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {lastUser}
                                        </span>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 align-middle text-right">
                                    <IconButton
                                        style="ghost"
                                        tone="default"
                                        size="sm"
                                        onClick={() => onEdit(item)}
                                        aria-label="Edit"
                                    >
                                        <Pencil size={14} />
                                    </IconButton>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </Surface>
    );
}