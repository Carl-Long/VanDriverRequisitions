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
import { getStdChargeTypeLabel } from "../constants/std-charge-type.constants";
import type { StdCollectionChargeBanksAndBinsSnapshot } from "../types/std-requisition-submission.types";

type Props = {
    rows: StdCollectionChargeBanksAndBinsSnapshot[];
};

export function StdSubmissionBanksAndBinsTable({ rows }: Readonly<Props>) {
    if (rows.length === 0) {
        return null;
    }

    const orderedRows = [...rows].sort(
        (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime() ||
            a.collectionTypeName.localeCompare(b.collectionTypeName) ||
            a.locationName.localeCompare(b.locationName),
    );

    const totals = orderedRows.reduce(
        (acc, row) => ({
            totalBags: acc.totalBags + (row.numberOfBags ?? 0),
            totalMiles: acc.totalMiles + (row.chargeType === "Mileage" ? row.miles ?? 0 : 0),
            subtotal: acc.subtotal + (row.totalValue ?? 0),
        }),
        {
            totalBags: 0,
            totalMiles: 0,
            subtotal: 0,
        },
    );

    return (
        <div className="rounded-2xl border border-border bg-surface p-6 print-card print-table-card">
            <div className="mb-6 print-section-heading">
                <h2 className="text-lg font-semibold">Collection Charges — Banks & Bins</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Submitted collection charges for banks and bins
                </p>

                <p className="text-sm text-muted-foreground">
                    {rows.length} entr{rows.length === 1 ? "y" : "ies"} • {totals.totalBags} bags •{" "}
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

                                <TableHeaderCell className="min-w-[180px]">
                                    Collection Type
                                </TableHeaderCell>

                                <TableHeaderCell className="min-w-[220px]">
                                    Location
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap>
                                    Bags
                                </TableHeaderCell>

                                <TableHeaderCell nowrap>Basis</TableHeaderCell>

                                <TableHeaderCell align="right" nowrap>
                                    Miles
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap className="print-col-rate">
                                    Rate / Flat
                                </TableHeaderCell>

                                <TableHeaderCell align="right" nowrap className="print-col-value">
                                    Value
                                </TableHeaderCell>
                            </TableHeaderRow>
                        </TableHeader>

                        <TableBody>
                            {orderedRows.map((row, index) => (
                                <TableRow key={`${row.date}-${row.collectionTypeId}-${row.locationId}-${index}`}>
                                    <TableCell nowrap className="print-col-week">
                                        {formatDateGB(row.date)}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col leading-tight">
                                            <span className="font-medium">
                                                {row.collectionTypeName}
                                            </span>

                                            <span className="text-xs text-muted-foreground">
                                                {row.collectionTypeCode}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col leading-tight">
                                            <span className="font-medium">
                                                {row.locationName}
                                            </span>

                                            {row.locationPostCode && (
                                                <span className="text-xs text-muted-foreground">
                                                    {row.locationPostCode}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.numberOfBags ?? "-"}
                                    </TableCell>

                                    <TableCell>{getStdChargeTypeLabel(row.chargeType)}</TableCell>

                                    <TableCell align="right" className="tabular-nums">
                                        {row.chargeType === "Mileage" ? row.miles ?? "-" : "-"}
                                    </TableCell>

                                    <TableCell align="right" className="tabular-nums print-col-rate">
                                        {row.chargeType === "Mileage"
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

                                <TableCell />

                                <TableCell align="right" className="tabular-nums">
                                    {totals.totalBags}
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