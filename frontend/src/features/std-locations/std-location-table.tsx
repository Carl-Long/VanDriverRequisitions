import { Pencil } from "lucide-react";

import { ActivityMetaCell } from "@/components/ui/activity-meta-cell";
import { IconButton } from "@/components/ui/button/icon-button";
import { Surface } from "@/components/ui/surface";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableHeaderRow, TableRow, } from "@/components/ui/table/table";
import { Toggle } from "@/components/ui/toggle";
import { StdLocation } from "./std-location.types";

type Props = {
    items: StdLocation[];
    onEdit: (item: StdLocation) => void;
    onToggleActive: (item: StdLocation) => void;
};

export function StdLocationTable({
    items,
    onEdit,
    onToggleActive,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <Table className="w-full">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Shop</TableHeaderCell>
                        <TableHeaderCell>Collection Type</TableHeaderCell>
                        <TableHeaderCell>Location</TableHeaderCell>
                        <TableHeaderCell>Postcode</TableHeaderCell>
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
                                <div className="font-medium text-foreground">
                                    {item.shopCode}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {item.shopName}
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="font-medium text-foreground">
                                    {item.collectionTypeCode}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {item.collectionTypeName}
                                </div>
                            </TableCell>

                            <TableCell className="font-medium text-foreground">
                                {item.locationName}
                            </TableCell>

                            <TableCell>{item.postCode}</TableCell>

                            <TableCell align="center">
                                <div className="flex justify-center">
                                    <Toggle
                                        checked={item.isActive}
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
                                        <Pencil size={14} />
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