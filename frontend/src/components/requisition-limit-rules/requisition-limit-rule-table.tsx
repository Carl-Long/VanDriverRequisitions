import { Pencil } from "lucide-react";

import { IconButton } from "@/components/ui/button/icon-button";
import { Surface } from "@/components/ui/surface";

import { TableHeaderRow } from "@/components/ui/table/table-header-row";
import { TableRow } from "@/components/ui/table/table-row";

import { formatDateGB } from "@/lib/format/date";
import { RequisitionLimitRuleSummary } from "@/lib/api/requisition-limit-rules";


type Props = {
    items: RequisitionLimitRuleSummary[];
    onEdit: (item: RequisitionLimitRuleSummary) => void;
};

export function RequisitionLimitRuleTable({
    items,
    onEdit,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <table className="w-full text-left text-sm">

                {/* HEADER */}
                <thead className="sticky top-0 z-10 border-b border-border bg-surface-elevated">
                    <TableHeaderRow>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Task Type</th>
                        <th className="px-4 py-3">Fascia</th>
                        <th className="px-4 py-3">Max Quantity</th>
                        <th className="px-4 py-3">Max Rate</th>
                        <th className="px-4 py-3">Last Modified</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </TableHeaderRow>
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
                            <TableRow
                                key={item.id}
                                className="hover:bg-surface-hover"
                            >
                                {/* Category */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="font-medium text-foreground">
                                        {item.categoryName}
                                    </div>
                                </td>

                                {/* Task Type */}
                                <td className="px-4 py-3 align-middle text-foreground-subtle">
                                    {item.feTaskTypeName ?? ""}
                                </td>

                                {/* Fascia */}
                                <td className="px-4 py-3 align-middle text-foreground-subtle">
                                    {item.fasciaName}
                                </td>

                                {/* Max Quantity */}
                                <td className="px-4 py-3 align-middle text-foreground">
                                    {item.maxQuantity}
                                </td>

                                {/* Max Rate */}
                                <td className="px-4 py-3 align-middle text-foreground">
                                    £{item.maxRate.toFixed(2)}
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