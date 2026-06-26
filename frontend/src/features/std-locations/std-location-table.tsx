import { Pencil } from "lucide-react";

import { ActivityMetaCell } from "@/components/ui/activity-meta-cell";
import { IconButton } from "@/components/ui/button/icon-button";
import { Surface } from "@/components/ui/surface";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableHeaderRow, TableRow, } from "@/components/ui/table/table";
import { Toggle } from "@/components/ui/toggle";
import { StdLocation } from "./std-location.types";

type Props = {
    items: StdLocation[];
    pendingIds?: ReadonlySet<string>;
    onEdit: (item: StdLocation) => void;
    onToggleActive: (item: StdLocation) => void;
};

export function StdLocationTable({
    items,
    pendingIds,
    onEdit,
    onToggleActive,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <Table className="w-full">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Location</TableHeaderCell>
                        <TableHeaderCell>Collection Type</TableHeaderCell>
                        <TableHeaderCell>Shop</TableHeaderCell>
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
                            <TableCell>
                                <div className="text-foreground">
                                    {item.locationName}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">
                                    {item.postCode}
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="text-foreground">
                                    {item.collectionTypeName}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">
                                    {item.collectionTypeCode}
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="text-foreground">
                                    {item.shopName}
                                </div>
                                <div className="text-xs font-medium text-muted-foreground">
                                    {item.shopCode}
                                </div>
                            </TableCell>

                            <TableCell align="center">
                                <div className="flex justify-center">
                                    <Toggle
                                        checked={item.isActive}
                                        loading={pendingIds?.has(item.id) ?? false}
                                        disabled={pendingIds?.has(item.id) ?? false}
                                        onChange={() => onToggleActive(item)}
                                        ariaLabel={`Toggle active for ${item.locationName}`}
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