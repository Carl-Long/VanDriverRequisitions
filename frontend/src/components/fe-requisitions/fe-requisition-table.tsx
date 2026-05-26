import { Surface } from "@/components/ui/surface";
import { TableHeaderRow } from "@/components/ui/table/table-header-row";
import { TableRow } from "@/components/ui/table/table-row";

import type { FeRequisitionSummary } from "@/lib/api/fe-requisitions";
import { formatDateGB } from "@/lib/format/date";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
    Draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    Submitted: { label: "Submitted", className: "bg-blue-500/10 text-blue-600" },
    Rejected: { label: "Rejected", className: "bg-red-500/10 text-red-600" },
    Resubmitted: { label: "Resubmitted", className: "bg-amber-500/10 text-amber-600" },
    SentToFinance: { label: "Sent to Finance", className: "bg-purple-500/10 text-purple-600" },
    Processed: { label: "Processed", className: "bg-emerald-500/10 text-emerald-600" },
    ReturnedFromFinance: { label: "Returned", className: "bg-orange-500/10 text-orange-600" },
};

// ─────────────────────────────────────────────────────────────────────────────


function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(value);
}

// ─────────────────────────────────────────────────────────────────────────────

function StatusPill({ status }: Readonly<{ status: string }>) {
    const config = statusConfig[status] ?? {
        label: status,
        className: "bg-muted text-muted-foreground",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

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
                                <StatusPill status={req.status} />
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