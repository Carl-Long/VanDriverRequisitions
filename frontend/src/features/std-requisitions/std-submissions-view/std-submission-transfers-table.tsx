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
import { getStdChargeTypeLabel, STD_CHARGE_TYPE } from "../constants/std-charge-type.constants";
import type { StdTransferSnapshot } from "../types/std-requisition-submission.types";

type Props = {
    rows: StdTransferSnapshot[];
};

export function StdSubmissionTransfersTable({ rows }: Readonly<Props>) {
    if (rows.length === 0) {
        return null;
    }

    const orderedRows = [...rows].sort(
        (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime() ||
            a.shopNameFrom.localeCompare(b.shopNameFrom) ||
            a.shopNameTo.localeCompare(b.shopNameTo),
    );

    const totals = orderedRows.reduce(
        (acc, row) => ({
            totalBags: acc.totalBags + (row.numberOfBags ?? 0),
            totalBoxes: acc.totalBoxes + (row.numberOfBoxes ?? 0),
            totalMiles:
                acc.totalMiles +
                (row.chargeType === STD_CHARGE_TYPE.Mileage ? row.miles ?? 0 : 0),
            subtotal: acc.subtotal + (row.totalValue ?? 0),
        }),
        {
            totalBags: 0,
            totalBoxes: 0,
            totalMiles: 0,
            subtotal: 0,
        },
    );

    return (
        <div className="rounded-2xl border border-border bg-surface p-6 print-card print-table-card">
            <div className="mb-6 print-section-heading">
                <h2 className="text-lg font-semibold">Transfers</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Submitted shop-to-shop transfer charges
                </p>

                <p className="text-sm text-muted-foreground">
                    {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                    {totals.totalBags} bags • {totals.totalBoxes} boxes •{" "}
                    {totals.totalMiles} miles • {formatCurrencyGB(totals.subtotal)}
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface print-table-wrapper">
                <div className="overflow-x-auto print-table-scroll">
                    <Table>
                        <TableHeader>
                            <TableHeaderRow>
                                <TableHeaderCell nowrap className="print-col-week">
                                    Date
                                </TableHeaderCell>

                                <TableHeaderCell className="min-w-[260px] print-col-transfer">
                                    Transfer
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap>
                                    Bags
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap>
                                    Boxes
                                </TableHeaderCell>

                                <TableHeaderCell nowrap>Charge Type</TableHeaderCell>

                                <TableHeaderCell align="right" nowrap>
                                    Miles
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap className="print-col-rate">
                                    Rate / Charge
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap className="print-col-value">
                                    Value
                                </TableHeaderCell>
                            </TableHeaderRow>
                        </TableHeader>

                        <TableBody>
                            {orderedRows.map((row, index) => (
                                <TableRow
                                    key={`${row.date}-${row.shopIdFrom}-${row.shopIdTo}-${index}`}
                                >
                                    <TableCell nowrap className="print-col-week">
                                        {formatDateGB(row.date)}
                                    </TableCell>
                                    <TableCell className="print-col-transfer">
                                        <div className="print-transfer-stack">
                                            <div className="text-sm print-transfer-line">
                                                <span className="text-muted-foreground print-transfer-label">
                                                    From:
                                                </span>{" "}
                                                <span className="font-medium print-transfer-shop">
                                                    {formatShop(
                                                        row.shopCodeFrom,
                                                        row.shopNameFrom,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="text-sm print-transfer-line">
                                                <span className="text-muted-foreground print-transfer-label">
                                                    To:
                                                </span>{" "}
                                                <span className="font-medium print-transfer-shop">
                                                    {formatShop(
                                                        row.shopCodeTo,
                                                        row.shopNameTo,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.numberOfBags ?? "-"}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.numberOfBoxes ?? "-"}
                                    </TableCell>

                                    <TableCell>
                                        {getStdChargeTypeLabel(row.chargeType)}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.chargeType === STD_CHARGE_TYPE.Mileage
                                            ? row.miles ?? "-"
                                            : "-"}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums print-col-rate">
                                        {row.chargeType === STD_CHARGE_TYPE.Mileage
                                            ? formatCurrencyGB(row.ratePerMile ?? 0)
                                            : formatCurrencyGB(row.flatCharge ?? 0)}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        className="font-semibold tabular-nums print-col-value"
                                    >
                                        {formatCurrencyGB(row.totalValue ?? 0)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                        <TableFooter>
                            <TableRow>
                                <TableCell className="print-col-week">Totals</TableCell>

                                <TableCell />

                                <TableCell align="right" className="tabular-nums">
                                    {totals.totalBags}
                                </TableCell>

                                <TableCell align="right" className="tabular-nums">
                                    {totals.totalBoxes}
                                </TableCell>

                                <TableCell />

                                <TableCell align="right" className="tabular-nums">
                                    {totals.totalMiles}
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