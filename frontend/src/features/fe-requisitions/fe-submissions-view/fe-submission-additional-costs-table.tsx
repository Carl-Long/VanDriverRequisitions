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
import type { FeAdditionalCostSnapshot } from "@/features/fe-requisitions/types/fe-requisition-submission.types";

type Props = {
    rows: FeAdditionalCostSnapshot[];
};

export function FeSubmissionAdditionalCostsTable({ rows }: Readonly<Props>) {
    if (rows.length === 0) {
        return null;
    }

    const orderedRows = [...rows].sort(
        (a, b) =>
            new Date(a.weekEndingDate).getTime() - new Date(b.weekEndingDate).getTime() ||
            (a.reasonText ?? "").localeCompare(b.reasonText ?? ""),
    );

    const totals = orderedRows.reduce(
        (acc, row) => ({
            totalJobQuantity:
                acc.totalJobQuantity +
                (row.chargingOption === "Mileage" ? 0 : row.totalNumber ?? 0),
            totalMiles:
                acc.totalMiles +
                (row.chargingOption === "Mileage" ? row.miles ?? 0 : 0),
            subtotal: acc.subtotal + row.totalValue,
        }),
        {
            totalJobQuantity: 0,
            totalMiles: 0,
            subtotal: 0,
        },
    );

    return (
        <div className="rounded-2xl border border-border bg-surface p-6 print-card print-table-card">
            <div className="mb-6 print-section-heading">
                <h2 className="text-lg font-semibold">Additional Costs</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Submitted additional job and mileage costs
                </p>

                <p className="text-sm text-muted-foreground">
                    {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                    {totals.totalJobQuantity} job qty • {totals.totalMiles} miles •{" "}
                    {formatCurrencyGB(totals.subtotal)}
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

                                <TableHeaderCell className="min-w-[220px]">
                                    Reason
                                </TableHeaderCell>

                                <TableHeaderCell nowrap>Type</TableHeaderCell>

                                <TableHeaderCell align="right" nowrap>
                                    Qty / Miles
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
                            {orderedRows.map((row, index) => {
                                const isMileage = row.chargingOption === "Mileage";

                                return (
                                    <TableRow key={`${row.weekEndingDate}-${row.reasonText}-${index}`}>
                                        <TableCell nowrap className="print-col-week">
                                            {formatDateGB(row.weekEndingDate)}
                                        </TableCell>

                                        <TableCell>
                                            <div className="font-medium">
                                                {row.reasonText ?? "-"}
                                            </div>
                                        </TableCell>

                                        <TableCell>{isMileage ? "Mileage" : "Job"}</TableCell>

                                        <TableCell align="right">
                                            {isMileage
                                                ? `${row.miles ?? 0} mi`
                                                : row.totalNumber ?? 0}
                                        </TableCell>

                                        <TableCell align="right" className="tabular-nums print-col-rate">
                                            {formatCurrencyGB(
                                                isMileage
                                                    ? row.ratePerMile ?? 0
                                                    : row.ratePerJob ?? 0,
                                            )}
                                        </TableCell>

                                        <TableCell
                                            align="right"
                                            className="font-semibold tabular-nums print-col-value"
                                        >
                                            {formatCurrencyGB(row.totalValue)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>

                        <TableFooter>
                            <TableRow>
                                <TableCell className="print-col-week">Totals</TableCell>

                                <TableCell />

                                <TableCell />

                                <TableCell align="right">
                                    {totals.totalJobQuantity} jobs / {totals.totalMiles} mi
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