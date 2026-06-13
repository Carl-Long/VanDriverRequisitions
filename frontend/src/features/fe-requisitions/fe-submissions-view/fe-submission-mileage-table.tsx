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
import type { FeMileageSnapshot } from "@/features/fe-requisitions/types/fe-requisition-submission.types";

type Props = {
    rows: FeMileageSnapshot[];
};

export function FeSubmissionMileageTable({ rows }: Readonly<Props>) {
    if (rows.length === 0) {
        return null;
    }

    const orderedRows = [...rows].sort(
        (a, b) =>
            new Date(a.weekEndingDate).getTime() - new Date(b.weekEndingDate).getTime(),
    );

    const totals = orderedRows.reduce(
        (acc, row) => ({
            sunday: acc.sunday + (row.week.sunday ?? 0),
            monday: acc.monday + (row.week.monday ?? 0),
            tuesday: acc.tuesday + (row.week.tuesday ?? 0),
            wednesday: acc.wednesday + (row.week.wednesday ?? 0),
            thursday: acc.thursday + (row.week.thursday ?? 0),
            friday: acc.friday + (row.week.friday ?? 0),
            saturday: acc.saturday + (row.week.saturday ?? 0),
            totalMiles: acc.totalMiles + row.totalMiles,
            subtotal: acc.subtotal + row.totalValue,
        }),
        {
            sunday: 0,
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            totalMiles: 0,
            subtotal: 0,
        },
    );

    return (
        <div className="rounded-2xl border border-border bg-surface p-6 print-card print-table-card">
            <div className="mb-6 print-section-heading">
                <h2 className="text-lg font-semibold">Mileage</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Submitted mileage quantities and values
                </p>

                <p className="text-sm text-muted-foreground">
                    {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                    {totals.totalMiles} miles • {formatCurrencyGB(totals.subtotal)}
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
                                    Total Miles
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
                            {orderedRows.map((row, index) => (
                                <TableRow key={`${row.weekEndingDate}-${index}`}>
                                    <TableCell nowrap className="print-col-week">
                                        {formatDateGB(row.weekEndingDate)}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {row.week.sunday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {row.week.monday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {row.week.tuesday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {row.week.wednesday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {row.week.thursday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {row.week.friday ?? 0}
                                    </TableCell>

                                    <TableCell align="center" className="print-col-day">
                                        {row.week.saturday ?? 0}
                                    </TableCell>

                                    <TableCell align="right" className="print-col-total">
                                        {row.totalMiles}
                                    </TableCell>

                                    <TableCell align="right" className="print-col-rate">
                                        {formatCurrencyGB(row.ratePerMile)}
                                    </TableCell>

                                    <TableCell
                                        align="right"
                                        className="font-semibold tabular-nums print-col-value"
                                    >
                                        {formatCurrencyGB(row.totalValue)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>

                        <TableFooter>
                            <TableRow>
                                <TableCell className="print-col-week">Totals</TableCell>

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