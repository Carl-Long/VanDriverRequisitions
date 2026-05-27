import { Surface } from "@/components/ui/surface";
import { TableHeaderRow } from "@/components/ui/table/table-header-row";
import { TableRow } from "@/components/ui/table/table-row";

import type { FeRequisitionSummary } from "@/lib/api/fe-requisitions";
import { formatDateGB } from "@/lib/format/date";
import { StatusPill } from "./status-pill";
import { formatCurrency } from "./requisition-form/utils";
import { RequisitionStatus } from "./constants";

type Props = {
    items: FeRequisitionSummary[];
    onRowClick: (item: FeRequisitionSummary) => void;
};

export function FeRequisitionTable({
    items,
    onRowClick,
}: Readonly<Props>) {
    return (
        <Surface className="overflow-x-auto">
            <table className="w-full text-left text-sm">

                {/* HEADER */}
                <thead className="sticky top-0 z-10 border-b border-border bg-surface-elevated">
                    <TableHeaderRow>
                        <th className="whitespace-nowrap px-4 py-3">
                            Req #
                        </th>

                        <th className="whitespace-nowrap px-4 py-3">
                            81 Code
                        </th>

                        <th className="px-4 py-3">
                            Trader Name
                        </th>

                        <th className="whitespace-nowrap px-4 py-3">
                            Date
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-right">
                            Amount
                        </th>

                        <th className="whitespace-nowrap px-4 py-3">
                            Status
                        </th>

                        <th className="px-4 py-3">
                            Driver
                        </th>

                        <th className="px-4 py-3">
                            Shop
                        </th>
                    </TableHeaderRow>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-border-subtle">
                    {items.map((req) => (
                        <TableRow
                            key={req.id}
                            onClick={() => onRowClick(req)}
                            className="cursor-pointer hover:bg-surface-hover"
                        >
                            {/* Req Number */}
                            <td className="whitespace-nowrap px-4 py-3 align-middle">
                                <span className="font-medium text-foreground">
                                    {req.requisitionNumber}
                                </span>
                            </td>

                            {/* 81 Code */}
                            <td className="whitespace-nowrap px-4 py-3 align-middle text-foreground-subtle">
                                {req.vanDriverCode}
                            </td>

                            {/* Trader */}
                            <td className="px-4 py-3 align-middle text-foreground">
                                {req.tradersName}
                            </td>

                            {/* Date */}
                            <td className="whitespace-nowrap px-4 py-3 align-middle text-muted-foreground">
                                {formatDateGB(req.requisitionDate)}
                            </td>

                            {/* Amount */}
                            <td className="whitespace-nowrap px-4 py-3 align-middle text-right font-medium tabular-nums text-foreground">
                                {formatCurrency(req.subtotal)}
                            </td>

                            {/* Status */}
                            <td className="whitespace-nowrap px-4 py-3 align-middle">
                                <StatusPill
                                    status={req.status as RequisitionStatus}
                                />
                            </td>

                            {/* Driver */}
                            <td className="px-4 py-3 align-middle text-foreground">
                                {req.vanDriverName}
                            </td>

                            {/* Shop */}
                            <td className="px-4 py-3 align-middle">
                                <div className="flex flex-col leading-tight">
                                    <span className="font-medium text-foreground">
                                        {req.shopCode}
                                    </span>

                                    <span className="text-xs text-muted-foreground">
                                        {req.shopName}
                                    </span>
                                </div>
                            </td>
                        </TableRow>
                    ))}
                </tbody>
            </table>
        </Surface>
    );
}