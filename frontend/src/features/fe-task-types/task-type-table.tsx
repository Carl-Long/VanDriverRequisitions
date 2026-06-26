import { Pencil } from "lucide-react";
import { FeTaskType } from "@/features/fe-task-types/fe-task-types-api";
import { IconButton } from "@/components/ui/button/icon-button";
import { ActivityMetaCell } from "@/components/ui/activity-meta-cell";
import { Surface } from "@/components/ui/surface";
import {
    TableHeader,
    TableHeaderRow,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
    Table,
} from "@/components/ui/table/table";
import { Toggle } from "@/components/ui/toggle";

type Props = {
    items: FeTaskType[];
    pendingIds?: ReadonlySet<string>;
    onEdit: (item: FeTaskType) => void;
    onToggleActive: (item: FeTaskType) => void;
};

export function TaskTypeTable({ items, pendingIds, onEdit, onToggleActive }: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <Table className="w-full">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Name</TableHeaderCell>
                        <TableHeaderCell>Code</TableHeaderCell>
                        <TableHeaderCell>Active</TableHeaderCell>
                        <TableHeaderCell>Last Activity</TableHeaderCell>
                        <TableHeaderCell align="right" nowrap>
                            Actions
                        </TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {items.map((item) => {
                        return (
                            <TableRow key={item.id} className="hover:bg-surface-hover">
                                {/* Name */}
                                <TableCell>
                                    <div className="font-medium text-foreground">{item.name}</div>
                                </TableCell>

                                {/* Code */}
                                <TableCell className="text-foreground-subtle">
                                    {item.code}
                                </TableCell>

                                {/* Active */}
                                <TableCell>
                                    <Toggle
                                        checked={item.isActive}
                                        loading={pendingIds?.has(item.id) ?? false}
                                        disabled={pendingIds?.has(item.id) ?? false}
                                        onChange={() => onToggleActive(item)}
                                        ariaLabel={`Toggle active for ${item.name}`}
                                    />
                                </TableCell>

                                {/* Last Modified */}
                                <TableCell>
                                    <ActivityMetaCell
                                        date={item.updatedAtUtc ?? item.createdAtUtc}
                                        user={
                                            item.updatedByNameSnapshot ?? item.createdByNameSnapshot
                                        }
                                    />
                                </TableCell>

                                {/* Actions */}
                                <TableCell align="right" nowrap>
                                    <div className="flex justify-end">
                                        <IconButton
                                            variant="ghost"
                                            tone="accent"
                                            size="sm"
                                            onClick={() => onEdit(item)}
                                            aria-label="Edit"
                                        >
                                            <Pencil className="size-[0.95em]" />
                                        </IconButton>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Surface>
    );
}
