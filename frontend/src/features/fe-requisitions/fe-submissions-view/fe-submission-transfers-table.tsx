"use client";

import {
    Table,
    TableHeader,
    TableHeaderRow,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
    TableFooter,
} from "@/components/ui/table/table";
import { formatCurrencyGB } from "@/lib/format/currency";
import { formatDateGB } from "@/lib/format/date";
import type { FeTransferSnapshot } from "@/features/fe-requisitions/types/fe-requisition-submission.types";

type Props = {
    transfers: FeTransferSnapshot[];
};

export function FeSubmissionTransfersTable({ transfers }: Readonly<Props>) {
    if (transfers.length === 0) {
        return null;
    }

    const orderedTransfers = [...transfers].sort(
        (a, b) =>
            new Date(a.weekEndingDate).getTime() - new Date(b.weekEndingDate).getTime() ||
            formatShop(a.shopCodeFrom, a.shopNameFrom).localeCompare(
                formatShop(b.shopCodeFrom, b.shopNameFrom),
            ) ||
            formatShop(a.shopCodeTo, a.shopNameTo).localeCompare(
                formatShop(b.shopCodeTo, b.shopNameTo),
            ),
    );

    const totals = orderedTransfers.reduce(
        (acc, transfer) => ({
            sunday: acc.sunday + (transfer.week.sunday ?? 0),
            monday: acc.monday + (transfer.week.monday ?? 0),
            tuesday: acc.tuesday + (transfer.week.tuesday ?? 0),
            wednesday: acc.wednesday + (transfer.week.wednesday ?? 0),
            thursday: acc.thursday + (transfer.week.thursday ?? 0),
            friday: acc.friday + (transfer.week.friday ?? 0),
            saturday: acc.saturday + (transfer.week.saturday ?? 0),
            totalNumber: acc.totalNumber + transfer.totalNumber,
            subtotal: acc.subtotal + transfer.totalValue,
        }),
        {
            sunday: 0,
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            totalNumber: 0,
            subtotal: 0,
        },
    );

    return (
        <div className="rounded-2xl border border-border bg-surface p-6 print-card print-table-card">
            <div className="mb-6 print-section-heading">
                <h2 className="text-lg font-semibold">Transfers</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Submitted transfer quantities and values
                </p>

                <p className="text-sm text-muted-foreground">
                    {transfers.length} entr{transfers.length === 1 ? "y" : "ies"} •{" "}
                    {totals.totalNumber} quantity • {formatCurrencyGB(totals.subtotal)}
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface print-table-wrapper">
                <div className="overflow-x-auto print-table-scroll">
                    <Table>
                        <TableHeader>
                            <TableHeaderRow>
                                <TableHeaderCell nowrap className="print-col-week">
                                    Week Ending
                                </TableHeaderCell>

                                <TableHeaderCell className="min-w-[260px] print-col-transfer">
                                    Transfer
                                </TableHeaderCell>

                                <TableHeaderCell align="center" className="print-col-day">
                                    Sun
                                </TableHeaderCell>

                                <TableHeaderCell align="center" className="print-col-day">
                                    Mon
                                </TableHeaderCell>

                                <TableHeaderCell align="center" className="print-col-day">
                                    Tue
                                </TableHeaderCell>

                                <TableHeaderCell align="center" className="print-col-day">
                                    Wed
                                </TableHeaderCell>

                                <TableHeaderCell align="center" className="print-col-day">
                                    Thu
                                </TableHeaderCell>

                                <TableHeaderCell align="center" className="print-col-day">
                                    Fri
                                </TableHeaderCell>

                                <TableHeaderCell align="center" className="print-col-day">
                                    Sat
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap className="print-col-total">
                                    Total Qty
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap className="print-col-rate">
                                    Rate
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap className="print-col-value">
                                    Value
                                </TableHeaderCell>
                            </TableHeaderRow>
                        </TableHeader>

                        <TableBody>
                            {orderedTransfers.map((transfer, index) => (
                                <TableRow key={`${transfer.weekEndingDate}-${index}`}>
                                    <TableCell nowrap className="print-col-week">
                                        {formatDateGB(transfer.weekEndingDate)}
                                    </TableCell>

                                    <TableCell className="print-col-transfer">
                                        <div className="print-transfer-stack">
                                            <div className="text-sm print-transfer-line">
                                                <span className="text-muted-foreground print-transfer-label">
                                                    From:
                                                </span>{" "}
                                                <span className="font-medium print-transfer-shop">
                                                    {formatShop(
                                                        transfer.shopCodeFrom,
                                                        transfer.shopNameFrom,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="text-sm print-transfer-line">
                                                <span className="text-muted-foreground print-transfer-label">
                                                    To:
                                                </span>{" "}
                                                <span className="font-medium print-transfer-shop">
                                                    {formatShop(
                                                        transfer.shopCodeTo,
                                                        transfer.shopNameTo,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {transfer.week.sunday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {transfer.week.monday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {transfer.week.tuesday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {transfer.week.wednesday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {transfer.week.thursday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {transfer.week.friday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {transfer.week.saturday ?? 0}
                                    </TableCell>

                                    <TableCell align="right" className="print-col-total">
                                        {transfer.totalNumber}
                                    </TableCell>

                                    <TableCell align="right" className="print-col-rate">
                                        {formatCurrencyGB(transfer.ratePerJob)}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        className="font-semibold tabular-nums print-col-value"
                                    >
                                        {formatCurrencyGB(transfer.totalValue)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                        <TableFooter>
                            <TableRow>
                                <TableCell className="print-col-week">Totals</TableCell>

                                <TableCell />

                                <TableCell align="center" className="print-col-day">
                                    {totals.sunday}
                                </TableCell>

                                <TableCell align="center" className="print-col-day">
                                    {totals.monday}
                                </TableCell>

                                <TableCell align="center" className="print-col-day">
                                    {totals.tuesday}
                                </TableCell>

                                <TableCell align="center" className="print-col-day">
                                    {totals.wednesday}
                                </TableCell>

                                <TableCell align="center" className="print-col-day">
                                    {totals.thursday}
                                </TableCell>

                                <TableCell align="center" className="print-col-day">
                                    {totals.friday}
                                </TableCell>

                                <TableCell align="center" className="print-col-day">
                                    {totals.saturday}
                                </TableCell>

                                <TableCell align="right" className="print-col-total">
                                    {totals.totalNumber}
                                </TableCell>

                                <TableCell className="print-col-rate" />

                                <TableCell
                                    align="right"
                                    className="font-semibold tabular-nums print-col-value"
                                >
                                    {formatCurrencyGB(totals.subtotal)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </div>
        </div>
    );
}

function formatShop(code?: string | null, name?: string | null) {
    if (code && name) {
        return `${code} - ${name}`;
    }

    return code ?? name ?? "-";
}