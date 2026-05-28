import { Surface } from "@/components/ui/surface";
import { TableHeaderRow } from "@/components/ui/table/table-header-row";
import { TableRow } from "@/components/ui/table/table-row";

import type { FeRequisitionSummary } from "@/lib/api/fe-requisitions";

import {
    formatDateGB,
    formatDateTime,
} from "@/lib/format/date";

import { StatusPill } from "./status-pill";
import { RequisitionStatus } from "./constants";
import { formatCurrency } from "@/lib/format/currency";

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
                        <th className="px-4 py-3">
                            Requisition
                        </th>

                        <th className="px-4 py-3">
                            Company
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-center">
                            Status
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-right">
                            Amount
                        </th>

                        <th className="px-4 py-3">
                            Shop
                        </th>

                        <th className="px-4 py-3">
                            Last Modified
                        </th>
                    </TableHeaderRow>
                </thead>

                {/* BODY */}
                <tbody className="divide-y divide-border-subtle">
                    {items.map((req) => {
                        const lastDate =
                            req.updatedAtUtc ?? req.createdAtUtc;

                        const lastUser =
                            req.updatedByNameSnapshot ??
                            req.createdByNameSnapshot ??
                            "System";

                        return (
                            <TableRow
                                key={req.id}
                                onClick={() => onRowClick(req)}
                                className="cursor-pointer hover:bg-surface-hover hover:shadow-sm transition-all"
                            >
                                {/* Requisition */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-semibold text-foreground">
                                            {req.requisitionNumber}
                                        </span>

                                        <span className="text-xs text-muted-foreground">
                                            {formatDateGB(req.requisitionDate)}
                                        </span>
                                    </div>
                                </td>

                                {/* Company */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-medium text-foreground">
                                            {req.vanDriverCode}
                                        </span>

                                        <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                                            {req.tradersName}
                                        </span>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="whitespace-nowrap px-4 py-3 align-middle text-center">
                                    <div className="flex justify-center">
                                        <StatusPill
                                            status={req.status as RequisitionStatus}
                                        />
                                    </div>
                                </td>

                                {/* Amount */}
                                <td className="whitespace-nowrap px-4 py-3 align-middle text-right font-semibold tabular-nums text-foreground">
                                    {formatCurrency(req.subtotal)}
                                </td>

                                {/* Shop */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="flex flex-col leading-tight">
                                        <span className="font-medium text-foreground">
                                            {req.shopCode}
                                        </span>

                                        <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                                            {req.shopName}
                                        </span>
                                    </div>
                                </td>

                                {/* Last Modified */}
                                <td className="px-4 py-3 align-middle">
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm text-foreground">
                                            {formatDateTime(lastDate) ?? "—"}
                                        </span>

                                        <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                                            {lastUser ?? "System"}
                                        </span>
                                    </div>
                                </td>
                            </TableRow>
                        );
                    })}
                </tbody>
            </table>
        </Surface>
    );
}