import { Pencil } from "lucide-react";

import { IconButton } from "@/components/ui/button/icon-button";
import { ActivityMetaCell } from "@/components/ui/activity-meta-cell";
import { Surface } from "@/components/ui/surface";
import { Toggle } from "@/components/ui/toggle";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableHeaderRow, TableRow, } from "@/components/ui/table/table";
import { CostReason } from "./cost-reason.types";

type Props = {
    items: CostReason[];
    pendingIds?: ReadonlySet<string>;
    onEdit: (item: CostReason) => void;
    onToggleActive: (item: CostReason) => void;
};

export function CostReasonTable({ items, pendingIds, onEdit, onToggleActive }: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <Table className="w-full">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Code</TableHeaderCell>
                        <TableHeaderCell>Reason</TableHeaderCell>
                        <TableHeaderCell>Scope</TableHeaderCell>
                        <TableHeaderCell align="center">Active</TableHeaderCell>
                        <TableHeaderCell>Last Activity</TableHeaderCell>
                        <TableHeaderCell align="right" nowrap>
                            Actions
                        </TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id} className="hover:bg-surface-hover">
                            <TableCell className="font-medium text-foreground">
                                {item.code}
                            </TableCell>

                            <TableCell>{item.reason}</TableCell>

                            <TableCell>{item.scopeName || item.scope}</TableCell>

                            <TableCell align="center">
                                <div className="flex justify-center">
                                    <Toggle
                                        checked={item.isActive}
                                        loading={pendingIds?.has(item.id) ?? false}
                                        disabled={pendingIds?.has(item.id) ?? false}
                                        onChange={() => onToggleActive(item)}
                                        ariaLabel={`Toggle active for ${item.code} - ${item.reason}`}
                                    />
                                </div>
                            </TableCell>

                            <TableCell>
                                <ActivityMetaCell
                                    date={item.updatedAtUtc ?? item.createdAtUtc}
                                    user={
                                        item.updatedByNameSnapshot ??
                                        item.createdByNameSnapshot ??
                                        "System"
                                    }
                                />
                            </TableCell>

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
                    ))}
                </TableBody>
            </Table>
        </Surface>
    );
}