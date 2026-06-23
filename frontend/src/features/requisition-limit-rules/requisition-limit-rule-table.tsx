import { Pencil } from "lucide-react";

import { IconButton } from "@/components/ui/button/icon-button";
import { Surface } from "@/components/ui/surface";

import { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { ActivityMetaCell } from "@/components/ui/activity-meta-cell";
import { formatCurrencyGB } from "@/lib/format/currency";
import {
    TableHeader,
    TableHeaderRow,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
    Table,
} from "@/components/ui/table/table";

type Props = {
    items: RequisitionLimitRuleSummary[];
    onEdit: (item: RequisitionLimitRuleSummary) => void;
};

export function RequisitionLimitRuleTable({ items, onEdit }: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <Table className="w-full">
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell>Category</TableHeaderCell>
                        <TableHeaderCell>Task Type</TableHeaderCell>
                        <TableHeaderCell>Fascia</TableHeaderCell>
                        <TableHeaderCell align="right">Max Quantity</TableHeaderCell>
                        <TableHeaderCell align="right">Max Rate</TableHeaderCell>
                        <TableHeaderCell align="right">Last Activity</TableHeaderCell>
                        <TableHeaderCell align="right" nowrap>
                            Actions
                        </TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {items.map((item) => {
                        return (
                            <TableRow key={item.id} className="hover:bg-surface-hover">
                                {/* Category */}
                                <TableCell>
                                    <div className="font-medium text-foreground">
                                        {item.categoryName}
                                    </div>
                                </TableCell>

                                {/* Task Type */}
                                <TableCell className="text-foreground-subtle">
                                    {item.feTaskTypeName ?? ""}
                                </TableCell>

                                {/* Fascia */}
                                <TableCell className="text-foreground-subtle">
                                    {item.fasciaName}
                                </TableCell>

                                {/* Max Quantity */}
                                <TableCell align="right" className="tabular-nums text-foreground">
                                    {item.maxQuantity}
                                </TableCell>

                                {/* Max Rate */}
                                <TableCell align="right" className="tabular-nums text-foreground">
                                    {formatCurrencyGB(item.maxRate)}
                                </TableCell>

                                {/* Last Modified */}
                                <TableCell align="right">
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
                                            <Pencil size={14} />
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
