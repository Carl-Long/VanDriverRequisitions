import { Pencil } from "lucide-react";

import { IconButton } from "@/components/ui/button/icon-button";
import { Surface } from "@/components/ui/surface";

import { RequisitionLimitRuleSummary } from "@/features/requisition-limit-rules/requisition-limit-rules-api";
import { ActivityMetaCell } from "@/components/ui/activity-meta-cell";
import { formatCurrencyGB } from "@/lib/format/currency";
import { TableHeader, TableHeaderRow, TableHeaderCell, TableBody, TableRow, TableCell, Table, } from "@/components/ui/table/table";
import { InactiveLookupWarning } from "../requisitions-shared/components/inactive-lookup-warning";
import { cn } from "@/lib/utils";

type Props = {
    items: RequisitionLimitRuleSummary[];
    onEdit: (item: RequisitionLimitRuleSummary) => void;
};

export function RequisitionLimitRuleTable({ items, onEdit }: Readonly<Props>) {

    function hasTaskTypeIssue(item: RequisitionLimitRuleSummary) {
        return (
            item.category === "GeneralTask" &&
            (!item.feTaskTypeName || item.isFeTaskTypeActive === false)
        );
    }

    function renderTaskTypeCell(item: RequisitionLimitRuleSummary) {
        if (item.category !== "GeneralTask") {
            return <span className="text-muted-foreground">—</span>;
        }

        if (!item.feTaskTypeName) {
            return <span className="text-warning">Missing task type</span>;
        }

        return (
            <div>
                <div>{item.feTaskTypeName}</div>

                {item.isFeTaskTypeActive === false && (
                    <InactiveLookupWarning label="task type" variant="table" />
                )}
            </div>
        );
    }

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
                        <TableHeaderCell>Last Activity</TableHeaderCell>
                        <TableHeaderCell align="right" nowrap>
                            Actions
                        </TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {items.map((item) => {
                        const hasIssue = hasTaskTypeIssue(item);

                        return (
                            <TableRow
                                key={item.id}
                                className={cn(
                                    "hover:bg-surface-hover",
                                    hasIssue && "bg-warning-surface/40 hover:bg-warning-surface/60",
                                )}
                            >
                                {/* Category */}
                                <TableCell>
                                    <div className="font-medium text-foreground">
                                        {item.categoryName}
                                    </div>
                                </TableCell>

                                {/* Task Type */}
                                <TableCell className="text-foreground-subtle">
                                    {renderTaskTypeCell(item)}
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
