import { Pencil } from "lucide-react";
import { FeTaskType } from "@/lib/api/fe-task-types";
import { IconButton } from "@/components/ui/button/icon-button";
import { Surface } from "../ui/surface";
import { Toggle } from "../ui/toggle";

import { formatDateGB } from "@/lib/format/date";
import { TableHeader, TableHeaderCell, TableBody, TableCell, TableHeaderRow, TableRow } from "../ui/table/table";

type Props = {
    items: FeTaskType[];
    onEdit: (item: FeTaskType) => void;
    onToggleActive: (item: FeTaskType) => void;
};

export function TaskTypeTable({
    items,
    onEdit,
    onToggleActive,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <table className="w-full text-sm">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Name</TableHeaderCell>
                        <TableHeaderCell>Code</TableHeaderCell>
                        <TableHeaderCell>Active</TableHeaderCell>
                        <TableHeaderCell>Last Activity</TableHeaderCell>
                        <TableHeaderCell align="right" nowrap>Actions</TableHeaderCell>
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
                            <TableRow
                                key={item.id}
                                className="hover:bg-surface-hover"
                            >
                                {/* Name */}
                                <TableCell>
                                    <div className="font-medium text-foreground">
                                        {item.name}
                                    </div>
                                </TableCell>

                                {/* Code */}
                                <TableCell className="text-foreground-subtle">
                                    {item.code}
                                </TableCell>

                                {/* Active */}
                                <TableCell>
                                    <Toggle
                                        checked={item.isActive}
                                        onChange={() => onToggleActive(item)}
                                        ariaLabel={`Toggle active for ${item.name}`}
                                    />
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