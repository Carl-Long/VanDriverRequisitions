import { Pencil } from "lucide-react";

import { FeReason } from "@/lib/api/fe-reasons";
import { IconButton } from "@/components/ui/button/icon-button";
import { Surface } from "@/components/ui/surface";
import { Toggle } from "@/components/ui/toggle";

import { formatDateGB } from "@/lib/format/date";
import { TableHeaderRow } from "../ui/table/table-header-row";
import { TableRow } from "../ui/table/table-row";

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

                <thead className="sticky top-0 z-10 bg-surface-elevated border-b border-border">
                    <TableHeaderRow>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Active</th>
                        <th className="px-4 py-3">Last modified</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </TableHeaderRow>
                </thead>

                <tbody className="divide-y divide-border-subtle">
                    {items.map((item) => {
                        const lastDate =
                            item.updatedAtUtc ?? item.createdAtUtc;

                        const lastUser =
                            item.updatedByNameSnapshot ??
                            item.createdByNameSnapshot ??
                            "System";

                        return (
                            <TableRow key={item.id}>
                                <td className="px-4 py-3 font-medium text-foreground">
                                    {item.reason}
                                </td>

                                <td className="px-4 py-3">
                                    <Toggle
                                        checked={item.isActive}
                                        onChange={() => onToggleActive(item)}
                                        ariaLabel={`Toggle active for ${item.reason}`}
                                    />
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm">
                                            {formatDateGB(lastDate) ?? "—"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {lastUser}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-right">
                                    <IconButton
                                        variant="ghost"
                                        tone="accent"
                                        size="sm"
                                        onClick={() => onEdit(item)}
                                        aria-label="Edit"
                                    >
                                        <Pencil size={14} />
                                    </IconButton>
                                </td>
                            </TableRow>
                        );
                    })}
                </tbody>
            </table>
        </Surface>
    );
}