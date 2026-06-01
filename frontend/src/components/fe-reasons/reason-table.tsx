import { Pencil } from "lucide-react";

import { FeReason } from "@/lib/api/fe-reasons";
import { IconButton } from "@/components/ui/button/icon-button";
import { Surface } from "@/components/ui/surface";
import { Toggle } from "@/components/ui/toggle";
import { formatDateGB } from "@/lib/format/date";
import { TableHeader, TableHeaderRow, TableHeaderCell, TableBody, TableRow, TableCell } from "../ui/table/table";

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
            <table className="w-full text-sm">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Reason</TableHeaderCell>
                        <TableHeaderCell align="center">Active</TableHeaderCell>
                        <TableHeaderCell>Last Activity</TableHeaderCell>
                        <TableHeaderCell
                            align="right"
                            nowrap
                        >
                            Actions
                        </TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {items.map((item) => {
                        const lastDate =
                            item.updatedAtUtc ?? item.createdAtUtc;

                        const lastUser =
                            item.updatedByNameSnapshot ??
                            item.createdByNameSnapshot ??
                            "System";

                        return (
                            <TableRow key={item.id}>
                                {/* Reason */}
                                <TableCell className="font-medium text-foreground">
                                    {item.reason}
                                </TableCell>

                                {/* Active */}
                                <TableCell align="center">
                                    <div className="flex justify-center">
                                        <Toggle
                                            checked={item.isActive}
                                            onChange={() => onToggleActive(item)}
                                            ariaLabel={`Toggle active for ${item.reason}`}
                                        />
                                    </div>
                                </TableCell>

                                {/* Last Modified */}
                                <TableCell>
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm text-foreground">
                                            {formatDateGB(lastDate) ?? "—"}
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            {lastUser}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Actions */}
                                <TableCell
                                    align="right"
                                    nowrap
                                >
                                    <div className="flex justify-end">
                                        <IconButton
                                            variant="ghost"
                                            tone="accent"
                                            size="sm"
                                            onClick={() => onEdit(item)}
                                            aria-label="Edit"
                                        >
                                            <Pencil size={14} />
                                        </IconButton>
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