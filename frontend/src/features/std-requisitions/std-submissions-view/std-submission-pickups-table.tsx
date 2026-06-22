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
import type { StdPickupSnapshot } from "../types/std-requisition-submission.types";
import { SubmissionSectionCard } from "@/features/requisitions-shared/components/submission-section-card";

type Props = {
    rows: StdPickupSnapshot[];
};

export function StdSubmissionPickupsTable({ rows }: Readonly<Props>) {
    if (rows.length === 0) {
        return null;
    }

    const orderedRows = [...rows].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const totals = orderedRows.reduce(
        (acc, row) => ({
            totalBags: acc.totalBags + row.numberOfBags,
            totalHouseholds: acc.totalHouseholds + row.numberOfHouseholds,
            totalMiles:
                acc.totalMiles + (row.chargeType === "Mileage" ? row.miles ?? 0 : 0),
            subtotal: acc.subtotal + row.totalValue,
        }),
        {
            totalBags: 0,
            totalHouseholds: 0,
            totalMiles: 0,
            subtotal: 0,
        },
    );

    return (
        <SubmissionSectionCard
            title="Pickup Collections"
            description="Submitted pickup collection charges"
            summary={
                <>
                    {rows.length} entr{rows.length === 1 ? "y" : "ies"} •{" "}
                    {totals.totalBags} bags • {totals.totalHouseholds} households •{" "}
                    {totals.totalMiles} miles • {formatCurrencyGB(totals.subtotal)}
                </>
            }
        >
            <Table>
                <TableHeader>
                    <TableHeaderRow>
                        <TableHeaderCell nowrap className="print-col-week">
                            Date
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Bags
                        </TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Households
                        </TableHeaderCell>

                        <TableHeaderCell nowrap>Charge Type</TableHeaderCell>

                        <TableHeaderCell align="right" nowrap>
                            Miles
                        </TableHeaderCell>

                        <TableHeaderCell
                            align="right"
                            nowrap
                            className="print-col-rate"
                        >
                            Rate / Charge
                        </TableHeaderCell>

                        <TableHeaderCell
                            align="right"
                            nowrap
                            className="print-col-value"
                        >
                            Value
                        </TableHeaderCell>
                    </TableHeaderRow>
                </TableHeader>

                <TableBody>
                    {orderedRows.map((row, index) => (
                        <TableRow key={`${row.date}-${row.chargeType}-${index}`}>
                            <TableCell nowrap className="print-col-week">
                                {formatDateGB(row.date)}
                            </TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {row.numberOfBags}
                            </TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {row.numberOfHouseholds}
                            </TableCell>

                            <TableCell>{getStdChargeTypeLabel(row.chargeType)}</TableCell>

                            <TableCell align="right" className="tabular-nums">
                                {row.chargeType === "Mileage" ? row.miles ?? "-" : "-"}
                            </TableCell>

                            <TableCell
                                align="right"
                                className="tabular-nums print-col-rate"
                            >
                                {row.chargeType === "Mileage"
                                    ? formatCurrencyGB(row.ratePerMile ?? 0)
                                    : formatCurrencyGB(row.flatCharge ?? 0)}
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

                        <TableCell align="right" className="tabular-nums">
                            {totals.totalBags}
                        </TableCell>

                        <TableCell align="right" className="tabular-nums">
                            {totals.totalHouseholds}
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
        </SubmissionSectionCard>
    );
}